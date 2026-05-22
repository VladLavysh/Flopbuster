<script setup lang="ts">
import { toPng } from "html-to-image";

import {
    buildPollinationsImageUrl,
    detectInjection,
    TROLL_IMAGE_URL,
    TROLL_MESSAGE,
    TROLL_POSTER,
} from "#shared/poster-guard";
import type {
    Genre,
    PosterData,
    PosterHistoryItem,
    SampleReview,
} from "./shared/types";
import type PosterPreviewCard from "./components/PosterPreviewCard.vue";

interface PosterResponse {
    title: string;
    tagline: string;
    releaseDate: string;
    imagePrompt: string;
}

interface EndpointResponse {
    data: PosterResponse;
    statusCode: number;
    statusMessage: string;
    trolled?: boolean;
}

const reviewText = ref("");
const selectedGenre = ref<Genre>("any");
const isLoading = ref(false);
const currentLoadingStep = ref(1);
const posterData = ref<PosterData | null>(null);
const posterHistory = ref<PosterHistoryItem[]>([]);
const elapsedSeconds = ref(0);
const posterContainerRef = ref<InstanceType<typeof PosterPreviewCard> | null>(
    null,
);
let loadingTimer: ReturnType<typeof setInterval> | null = null;

const STORAGE_KEY = "flopbuster:posterHistory";
const ERROR_PLACEHOLDER_IMAGE =
    "https://picsum.photos/seed/flopbuster-error/800/1200";

const toast = useToast();

const genreOptions: { label: string; value: Genre }[] = [
    { label: "Any", value: "any" },
    { label: "Sci-Fi", value: "sci-fi" },
    { label: "Horror", value: "horror" },
    { label: "Rom-Com", value: "rom-com" },
    { label: "Action", value: "action" },
    { label: "Period Drama", value: "period-drama" },
    { label: "Thriller", value: "thriller" },
    { label: "Fantasy", value: "fantasy" },
    { label: "Mystery", value: "mystery" },
    { label: "Noir", value: "noir" },
    { label: "Western", value: "western" },
    { label: "Disaster", value: "disaster" },
] as const;

const loadingStepOptions: readonly string[][] = [
    [
        "Reading the angry rant",
        "Decoding the one-star emotional damage report",
        "Extracting chaos, sarcasm, and customer pain points",
        "Analyzing the complaint like a courtroom monologue",
    ],
    [
        "Hiring Hollywood scriptwriters",
        "Summoning dramatic screenwriters from the cloud",
        "Turning raw outrage into blockbuster-level plot beats",
        "Forging a cinematic storyline from pure frustration",
    ],
    [
        "Painting the masterpiece",
        "Composing lights, shadows, and trailer-worthy tension",
        "Rendering the final poster with maximum dramatic energy",
        "Directing pixels into a glorious flopbuster cover",
    ],
];

const activeLoadingSteps = ref<string[]>(
    loadingStepOptions.map((group) => group[0] ?? ""),
);

function pickRandomStepText() {
    activeLoadingSteps.value = loadingStepOptions.map((group) => {
        if (group.length === 0) return "";
        const randomIndex = Math.floor(Math.random() * group.length);
        return group[randomIndex] as string;
    });
}

const sampleReviews: SampleReview[] = [
    {
        title: "The Seagull Incident",
        text: "I ordered chips by the beach and a seagull launched a full tactical strike. The staff said, 'That happens sometimes.' My lunch became a sky buffet.",
        genre: "action",
    },
    {
        title: "Haunted Hotel Stay",
        text: "The room had no hot water, the TV only showed static, and the hallway lights flickered all night. I am 90% sure the minibar sighed at me.",
        genre: "horror",
    },
    {
        title: "Romance Gone Wrong",
        text: "They seated us beside the kitchen exit, forgot our anniversary dessert, and called my partner by my ex's name from the reservation notes. Magical.",
        genre: "rom-com",
    },
    {
        title: "Orbit of Regret",
        text: "The airline lost my luggage, rebooked me through three countries, and my in-flight meal was a single olive. The captain called it a light snack.",
        genre: "sci-fi",
    },
    {
        title: "The Mystery of Table 9",
        text: "We waited an hour for food, then our server delivered a birthday cake to us and sang to the wrong name with full confidence. We never ordered dessert.",
        genre: "mystery",
    },
    {
        title: "Castle of Complaints",
        text: "The historic tour promised knights and falcons. We got a cracked audio guide and a pigeon that followed us for 40 minutes like a tax collector.",
        genre: "period-drama",
    },
    {
        title: "Noir Coffee Blues",
        text: "The barista stared into the distance, whispered 'we're out of joy,' and handed me a latte that tasted like burned midnight.",
        genre: "noir",
    },
    {
        title: "Tumbleweed Checkout",
        text: "The hotel lobby was empty except for country music and a mechanical bull. Check-in took 55 minutes because the printer 'needed to find itself.'",
        genre: "western",
    },
    {
        title: "Dragon-Sized Delay",
        text: "Our package said next-day delivery. Five days later it arrived soaked, torn, and with a sticker that read 'handled with magic.'",
        genre: "fantasy",
    },
    {
        title: "Evacuation Announcement",
        text: "The cinema fire alarm went off mid-movie, and staff told us to stay calm while they debated if it was 'part of the immersive experience.'",
        genre: "disaster",
    },
    {
        title: "Night Shift Panic",
        text: "Customer support transferred me six times, each agent saying 'interesting case' before vanishing like they were in witness protection.",
        genre: "thriller",
    },
];

function getRandomSamples(
    items: SampleReview[],
    count: number,
): SampleReview[] {
    return [...items].sort(() => Math.random() - 0.5).slice(0, count);
}

const visibleSampleReviews = ref<SampleReview[]>(
    getRandomSamples(sampleReviews, 3),
);

const canGenerate = computed(
    () => reviewText.value.trim().length > 0 && !isLoading.value,
);

const wait = (ms: number) =>
    new Promise<void>((resolve) => {
        setTimeout(resolve, ms);
    });

async function waitForImageReady(
    imageUrl: string,
    retries = 12,
    delayMs = 1000,
): Promise<void> {
    for (let attempt = 0; attempt <= retries; attempt += 1) {
        try {
            await new Promise<void>((resolve, reject) => {
                const img = new Image();
                img.onload = () => resolve();
                img.onerror = () => reject(new Error("Image not ready"));
                img.src = imageUrl;
            });
            return;
        } catch {
            if (attempt === retries) {
                return;
            }
            await wait(delayMs);
        }
    }
}

function scrollToTheBottom() {
    if (window.innerWidth <= 1023) {
        window.scrollTo({
            top: document.body.scrollHeight,
            behavior: "smooth",
        });
    }
}

function startLoadingTimer() {
    stopLoadingTimer();
    elapsedSeconds.value = 0;
    loadingTimer = setInterval(() => {
        elapsedSeconds.value += 1;
    }, 1000);
}

function stopLoadingTimer() {
    if (loadingTimer) {
        clearInterval(loadingTimer);
        loadingTimer = null;
    }
}

function setErrorFallbackPoster() {
    posterData.value = {
        title: "GENERATION FAILED",
        tagline: "Hollywood unionized. Try again in a moment.",
        releaseDate: "COMING SOON",
        imageUrl: ERROR_PLACEHOLDER_IMAGE,
        reviewText: reviewText.value,
        genre: selectedGenre.value,
    };
}

function showTrollToast(description = TROLL_MESSAGE) {
    toast.add({
        title: "Prompt injection detected",
        description,
        color: "warning",
        icon: "i-heroicons-face-smile",
    });
}

async function finishPoster(imageUrl: string, poster: PosterResponse) {
    posterData.value = {
        title: poster.title,
        tagline: poster.tagline,
        releaseDate: poster.releaseDate,
        imageUrl,
        reviewText: reviewText.value,
        genre: selectedGenre.value,
    };

    await wait(3000);
    currentLoadingStep.value = 3;
    await waitForImageReady(imageUrl);

    posterHistory.value = [
        ...posterHistory.value,
        {
            id: Date.now(),
            ...posterData.value,
        },
    ].slice(0, 10);
}

function showTrollPoster(toastDescription = TROLL_MESSAGE) {
    stopLoadingTimer();
    isLoading.value = false;
    currentLoadingStep.value = 1;

    showTrollToast(toastDescription);
    scrollToTheBottom();

    posterData.value = {
        title: TROLL_POSTER.title,
        tagline: TROLL_POSTER.tagline,
        releaseDate: TROLL_POSTER.releaseDate,
        imageUrl: TROLL_IMAGE_URL,
        reviewText: reviewText.value,
        genre: selectedGenre.value,
    };
}

async function generatePoster() {
    if (!canGenerate.value) return;

    if (detectInjection(reviewText.value)) {
        showTrollPoster();
        return;
    }

    pickRandomStepText();
    startLoadingTimer();
    scrollToTheBottom();
    posterData.value = null;
    isLoading.value = true;
    currentLoadingStep.value = 1;

    try {
        const { data, statusCode, statusMessage, trolled } =
            await $fetch<EndpointResponse>("/api/generate-prompt", {
                method: "POST",
                body: {
                    reviewText: reviewText.value,
                    genre: selectedGenre.value,
                    currentDateISO: new Date().toISOString(),
                },
            });

        if (statusCode >= 400) {
            throw new Error(statusMessage);
        }

        if (trolled) {
            showTrollPoster(statusMessage);
            return;
        }

        currentLoadingStep.value = 2;
        const imageUrl = buildPollinationsImageUrl(data.imagePrompt);
        await finishPoster(imageUrl, data);
    } catch (error: any) {
        const description =
            error?.data?.statusMessage ||
            error?.statusMessage ||
            error?.message ||
            "Failed to generate poster. Please try again.";

        toast.add({
            title: "Poster generation failed",
            description,
            color: "error",
            icon: "i-heroicons-exclamation-triangle",
        });

        setErrorFallbackPoster();
        console.error("Generation failed:", error);
    } finally {
        stopLoadingTimer();
        isLoading.value = false;
    }
}

function loadSample(text: string, genre: Genre) {
    reviewText.value = text;
    selectedGenre.value = genre;
}

function loadHistoryItem(item: PosterHistoryItem) {
    if (isLoading.value) return;

    isLoading.value = true;

    posterData.value = { ...item };
    reviewText.value = item.reviewText;
    selectedGenre.value = item.genre;

    isLoading.value = false;
    currentLoadingStep.value = 1;

    stopLoadingTimer();
}

async function downloadPoster() {
    try {
        const posterContainer = posterContainerRef.value?.posterContainer;

        if (!posterContainer || !posterData.value) {
            throw new Error("Poster container or data is not available");
        }

        const dataUrl = await toPng(posterContainer, {
            cacheBust: true,
            quality: 0.95,
        });
        const fileName = posterData.value.title
            .toLowerCase()
            .replace(/[^a-z0-9]/g, "_");
        const link = document.createElement("a");

        link.download = `flopbuster_${fileName}.png`;
        link.href = dataUrl;
        link.click();
    } catch (error) {
        toast.add({
            title: "Download failed",
            description:
                "Could not download the poster file. Try copying the link.",
            color: "error",
            icon: "i-heroicons-exclamation-triangle",
        });
        console.error("Download failed:", error);
    }
}

async function copyPosterLink() {
    if (!posterData.value) return;

    try {
        await navigator.clipboard.writeText(posterData.value.imageUrl);
        toast.add({
            title: "Link copied",
            description: "Poster image link copied to clipboard.",
            color: "success",
            icon: "i-heroicons-clipboard-document-check",
        });
    } catch (error) {
        toast.add({
            title: "Copy failed",
            description: "Could not copy link. Please copy it manually.",
            color: "error",
            icon: "i-heroicons-exclamation-triangle",
        });
        console.error("Copy failed:", error);
    }
}

watch(
    posterHistory,
    (newHistory) => {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(newHistory));
    },
    { deep: true },
);

onMounted(() => {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return;

    try {
        posterHistory.value = JSON.parse(raw);
    } catch {
        localStorage.removeItem(STORAGE_KEY);
    }
});

onBeforeUnmount(() => {
    stopLoadingTimer();
});
</script>

<template>
    <UApp>
        <main
            class="min-h-screen bg-linear-to-br from-slate-950 via-slate-900 to-gray-950 text-slate-100"
        >
            <div
                class="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-12"
            >
                <header class="mb-8 lg:mb-10">
                    <p
                        class="text-sm uppercase tracking-[0.3em] text-slate-400"
                    >
                        Flopbuster Studio
                    </p>
                    <h1
                        class="mt-2 text-3xl font-bold text-white sm:text-4xl lg:text-5xl"
                    >
                        Flopbuster: The Bad Review Movie Poster Generator
                    </h1>
                    <p class="mt-3 max-w-3xl text-slate-300">
                        Turn customer chaos into cinematic glory. Paste a
                        dreadful review, pick a genre, and watch it become an
                        epic poster concept.
                    </p>
                </header>

                <section class="grid grid-cols-1 gap-6 lg:grid-cols-2 lg:gap-8">
                    <GeneratorInputCard
                        v-model:review-text="reviewText"
                        v-model:selected-genre="selectedGenre"
                        :is-loading="isLoading"
                        :can-generate="canGenerate"
                        :genre-options="genreOptions"
                        :sample-reviews="visibleSampleReviews"
                        @generate="generatePoster"
                        @load-sample="
                            loadSample($event.text, $event.genre as Genre)
                        "
                    />

                    <PosterPreviewCard
                        ref="posterContainerRef"
                        :key="posterData?.imageUrl"
                        :is-loading="isLoading"
                        :current-loading-step="currentLoadingStep"
                        :active-loading-steps="activeLoadingSteps"
                        :elapsed-seconds="elapsedSeconds"
                        :poster-data="posterData"
                        :poster-history="posterHistory"
                        :max-history="10"
                        @download="downloadPoster"
                        @copy-link="copyPosterLink"
                        @load-history="loadHistoryItem"
                    />
                </section>
            </div>
        </main>

        <UToaster />
    </UApp>
</template>
