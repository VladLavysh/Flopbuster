<script setup lang="ts">
import { computed, onBeforeUnmount, ref } from "vue";

type Genre =
    | "sci-fi"
    | "horror"
    | "rom-com"
    | "action"
    | "period-drama"
    | "thriller"
    | "fantasy"
    | "mystery"
    | "noir"
    | "western"
    | "disaster";

interface PosterResponse {
    title: string;
    tagline: string;
    imageUrl: string;
}

interface PosterHistoryItem extends PosterResponse {
    id: number;
    reviewText: string;
    genre: Genre;
}

interface SampleReview {
    title: string;
    text: string;
    genre: Genre;
}

const reviewText = ref("");
const selectedGenre = ref<Genre>("sci-fi");
const isLoading = ref(false);
const currentLoadingStep = ref(1);
const posterResponse = ref<PosterResponse | null>(null);
const posterHistory = ref<PosterHistoryItem[]>([]);
const elapsedSeconds = ref(0);
let loadingTimer: ReturnType<typeof setInterval> | null = null;

const genreOptions: { label: string; value: Genre }[] = [
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

async function generatePoster() {
    if (!canGenerate.value) return;

    const sourceReviewText = reviewText.value;
    const sourceGenre = selectedGenre.value;

    pickRandomStepText();
    posterResponse.value = null;
    isLoading.value = true;
    currentLoadingStep.value = 1;
    startLoadingTimer();

    await wait(3500);
    currentLoadingStep.value = 2;

    await wait(3500);
    currentLoadingStep.value = 3;

    await wait(3500);

    posterResponse.value = {
        title: "THE SEAGULL CHRONICLES",
        tagline: "They didn't just steal the chips. They stole her dignity.",
        imageUrl: "https://picsum.photos/600/900",
    };

    posterHistory.value = [
        {
            id: Date.now(),
            ...posterResponse.value,
            reviewText: sourceReviewText,
            genre: sourceGenre,
        },
        ...posterHistory.value,
    ].slice(0, 5);

    isLoading.value = false;
    stopLoadingTimer();
}

function loadSample(text: string, genre: Genre) {
    reviewText.value = text;
    selectedGenre.value = genre;
}

function startOver() {
    reviewText.value = "";
    selectedGenre.value = "sci-fi";
    isLoading.value = false;
    currentLoadingStep.value = 1;
    posterResponse.value = null;
    elapsedSeconds.value = 0;
    stopLoadingTimer();
}

function downloadPosterByUrl(imageUrl: string, title: string) {
    const link = document.createElement("a");
    link.href = imageUrl;
    link.download = `${title.toLowerCase().replace(/\s+/g, "-")}.jpg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

function loadHistoryItem(item: PosterHistoryItem) {
    posterResponse.value = {
        title: item.title,
        tagline: item.tagline,
        imageUrl: item.imageUrl,
    };
    reviewText.value = item.reviewText;
    selectedGenre.value = item.genre;
    isLoading.value = false;
    currentLoadingStep.value = 1;
    stopLoadingTimer();
}

function downloadPoster() {
    if (!posterResponse.value) return;
    downloadPosterByUrl(
        posterResponse.value.imageUrl,
        posterResponse.value.title,
    );
}

onBeforeUnmount(() => {
    stopLoadingTimer();
});
</script>

<template>
    <main
        class="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-gray-950 text-slate-100"
    >
        <div
            class="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-12"
        >
            <header class="mb-8 lg:mb-10">
                <p class="text-sm uppercase tracking-[0.3em] text-slate-400">
                    Flopbuster Studio
                </p>
                <h1
                    class="mt-2 text-3xl font-bold text-white sm:text-4xl lg:text-5xl"
                >
                    Flopbuster: The Bad Review Movie Poster Generator
                </h1>
                <p class="mt-3 max-w-3xl text-slate-300">
                    Turn customer chaos into cinematic glory. Paste a dreadful
                    review, pick a genre, and watch it become an epic poster
                    concept.
                </p>
            </header>

            <section class="grid grid-cols-1 gap-6 lg:grid-cols-2 lg:gap-8">
                <UCard
                    class="border border-slate-800/80 bg-slate-900/70 backdrop-blur"
                    :ui="{ body: 'space-y-6' }"
                >
                    <template #header>
                        <div class="flex items-center gap-3">
                            <UIcon
                                name="i-heroicons-pencil-square"
                                class="size-5 text-amber-300"
                            />
                            <h2 class="text-lg font-semibold text-white">
                                Your Source Material
                            </h2>
                        </div>
                    </template>

                    <div class="space-y-5">
                        <div class="space-y-2">
                            <label class="text-sm font-medium text-slate-200"
                                >Bad Review</label
                            >
                            <UTextarea
                                v-model="reviewText"
                                :rows="8"
                                autoresize
                                color="neutral"
                                variant="outline"
                                placeholder="The waiter disappeared for 40 minutes and returned with someone elses soup..."
                                class="w-full"
                            />
                        </div>

                        <div class="space-y-2">
                            <label class="text-sm font-medium text-slate-200"
                                >Movie Genre</label
                            >
                            <USelect
                                v-model="selectedGenre"
                                :items="genreOptions"
                                option-attribute="label"
                                value-attribute="value"
                                class="w-full"
                            />
                        </div>

                        <UButton
                            block
                            size="lg"
                            color="primary"
                            icon="i-heroicons-sparkles"
                            :loading="isLoading"
                            :disabled="!canGenerate"
                            @click="generatePoster"
                        >
                            Generate Poster
                        </UButton>
                    </div>

                    <template #footer>
                        <div class="space-y-3">
                            <p class="text-sm font-semibold text-slate-200">
                                Need inspiration?
                            </p>
                            <div class="space-y-3">
                                <button
                                    v-for="sample in visibleSampleReviews"
                                    :key="sample.title"
                                    type="button"
                                    class="w-full rounded-xl border border-slate-800 bg-slate-900/80 p-4 text-left transition hover:border-slate-600 hover:bg-slate-800/80"
                                    @click="
                                        loadSample(sample.text, sample.genre)
                                    "
                                >
                                    <div
                                        class="mb-1 flex items-center justify-between gap-2"
                                    >
                                        <p class="font-medium text-slate-100">
                                            {{ sample.title }}
                                        </p>
                                        <span
                                            class="rounded-full border border-slate-700 px-2 py-0.5 text-xs text-slate-300"
                                        >
                                            {{ sample.genre }}
                                        </span>
                                    </div>
                                    <p
                                        class="line-clamp-2 text-sm text-slate-400"
                                    >
                                        {{ sample.text }}
                                    </p>
                                </button>
                            </div>
                        </div>
                    </template>
                </UCard>

                <UCard
                    class="border border-slate-800/80 bg-slate-900/70 backdrop-blur"
                    :ui="{ body: 'space-y-6' }"
                >
                    <template #header>
                        <div class="flex items-center gap-3">
                            <UIcon
                                name="i-heroicons-film"
                                class="size-5 text-cyan-300"
                            />
                            <h2 class="text-lg font-semibold text-white">
                                Poster Preview
                            </h2>
                        </div>
                    </template>

                    <Transition name="preview-panel" mode="out-in">
                        <div v-if="isLoading" key="loading" class="space-y-4">
                            <div
                                class="loading-poster-shell relative mx-auto aspect-[2/3] w-full max-w-sm overflow-hidden rounded-2xl border border-slate-700 shadow-2xl shadow-black/40"
                            >
                                <USkeleton class="absolute inset-0 z-0" />

                                <div
                                    class="loading-poster-layer loading-poster-layer--1"
                                    :class="{
                                        'is-active': currentLoadingStep === 1,
                                    }"
                                />
                                <div
                                    class="loading-poster-layer loading-poster-layer--2"
                                    :class="{
                                        'is-active': currentLoadingStep === 2,
                                    }"
                                />
                                <div
                                    class="loading-poster-layer loading-poster-layer--3"
                                    :class="{
                                        'is-active': currentLoadingStep === 3,
                                    }"
                                />

                                <div class="loading-poster-glow" />
                                <div
                                    class="absolute left-4 top-4 z-40 rounded-full border border-slate-600/80 bg-slate-900/75 px-3 py-1 text-xs font-medium text-slate-200 backdrop-blur"
                                >
                                    Generating: {{ elapsedSeconds }}s
                                </div>
                                <div
                                    class="absolute inset-0 z-30 bg-gradient-to-b from-slate-950/35 via-slate-900/30 to-slate-950/75"
                                />

                                <div
                                    class="absolute inset-x-0 bottom-0 z-40 p-4 sm:p-5"
                                >
                                    <TransitionGroup
                                        name="steps-list"
                                        tag="ol"
                                        class="space-y-2.5"
                                        appear
                                    >
                                        <li
                                            v-for="(
                                                step, index
                                            ) in activeLoadingSteps"
                                            :key="step"
                                            :class="[
                                                'loading-step-card',
                                                {
                                                    'loading-step-active':
                                                        index + 1 ===
                                                        currentLoadingStep,
                                                },
                                            ]"
                                        >
                                            <div
                                                class="loading-step-content flex items-start gap-3"
                                            >
                                                <div
                                                    class="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full border text-xs font-semibold"
                                                    :class="
                                                        index + 1 <=
                                                        currentLoadingStep
                                                            ? 'border-emerald-400 bg-emerald-500/20 text-emerald-200'
                                                            : 'border-slate-700 bg-slate-800 text-slate-400'
                                                    "
                                                >
                                                    <UIcon
                                                        v-if="
                                                            index + 1 <
                                                            currentLoadingStep
                                                        "
                                                        name="i-heroicons-check"
                                                        class="size-4"
                                                    />
                                                    <span v-else>{{
                                                        index + 1
                                                    }}</span>
                                                </div>
                                                <p
                                                    class="pt-0.5 text-sm"
                                                    :class="
                                                        index + 1 <=
                                                        currentLoadingStep
                                                            ? 'text-slate-100'
                                                            : 'text-slate-500'
                                                    "
                                                >
                                                    {{ step
                                                    }}<span
                                                        v-if="
                                                            index + 1 ===
                                                            currentLoadingStep
                                                        "
                                                        class="loading-dots"
                                                        aria-hidden="true"
                                                        >...</span
                                                    >
                                                </p>
                                            </div>
                                        </li>
                                    </TransitionGroup>
                                </div>
                            </div>
                        </div>

                        <div
                            v-else-if="posterResponse"
                            key="success"
                            class="space-y-5"
                        >
                            <div
                                class="mx-auto w-full max-w-sm [perspective:1200px]"
                            >
                                <Transition name="poster-flip" appear>
                                    <div
                                        :key="posterResponse.imageUrl"
                                        class="poster-reveal-card relative aspect-[2/3] overflow-hidden rounded-2xl border border-slate-700 shadow-2xl shadow-black/60"
                                    >
                                        <NuxtImg
                                            :src="posterResponse.imageUrl"
                                            :alt="posterResponse.title"
                                            width="600"
                                            height="900"
                                            class="h-full w-full object-cover"
                                        />
                                        <div
                                            class="absolute inset-0 bg-gradient-to-t from-black via-black/15 to-transparent"
                                        />
                                        <div class="poster-sheen" />

                                        <div
                                            class="absolute inset-x-0 bottom-0 p-5 text-center"
                                        >
                                            <p
                                                class="text-[10px] uppercase tracking-[0.4em] text-slate-300"
                                            >
                                                A Flopbuster Original
                                            </p>
                                            <h3
                                                class="mt-2 text-2xl font-extrabold uppercase tracking-[0.16em] text-white sm:text-3xl"
                                            >
                                                {{ posterResponse.title }}
                                            </h3>
                                            <p
                                                class="mt-3 text-sm italic text-slate-200 sm:text-base"
                                            >
                                                "{{ posterResponse.tagline }}"
                                            </p>
                                        </div>
                                    </div>
                                </Transition>
                            </div>

                            <div class="flex flex-col gap-3 sm:flex-row">
                                <UButton
                                    block
                                    color="primary"
                                    icon="i-heroicons-arrow-down-tray"
                                    @click="downloadPoster"
                                >
                                    Download Poster
                                </UButton>
                                <UButton
                                    block
                                    color="neutral"
                                    variant="soft"
                                    icon="i-heroicons-arrow-path"
                                    @click="startOver"
                                >
                                    Start Over
                                </UButton>
                            </div>
                        </div>

                        <div
                            v-else
                            key="empty"
                            class="flex min-h-[420px] flex-col items-center justify-center rounded-2xl border border-dashed border-slate-700 bg-slate-950/40 p-6 text-center"
                        >
                            <UIcon
                                name="i-heroicons-photo"
                                class="mb-4 size-10 text-slate-500"
                            />
                            <p class="text-lg font-semibold text-slate-200">
                                Your blockbuster failure poster will appear
                                here.
                            </p>
                            <p class="mt-2 max-w-md text-sm text-slate-400">
                                Add a hilariously bad review on the left, choose
                                a genre, and hit Generate Poster.
                            </p>
                        </div>
                    </Transition>

                    <div class="border-t border-slate-800/90 pt-4">
                        <div class="mb-3 flex items-center gap-2">
                            <UIcon
                                name="i-heroicons-clock"
                                class="size-4 text-slate-400"
                            />
                            <p class="text-sm font-semibold text-slate-200">
                                Recent Posters ({{ posterHistory.length }}/5)
                            </p>
                        </div>

                        <div
                            v-if="posterHistory.length"
                            class="flex items-center overflow-x-auto p-2"
                        >
                            <button
                                v-for="(item, index) in posterHistory"
                                :key="item.id"
                                type="button"
                                :class="[
                                    'group relative h-28 w-[84px] shrink-0 overflow-hidden rounded-lg border border-slate-700 shadow-lg transition-transform duration-300 hover:z-20 hover:scale-105 hover:border-slate-500 cursor-pointer',
                                    index === 0 ? '' : '-ml-5',
                                ]"
                                :title="`Load ${item.title}`"
                                @click="loadHistoryItem(item)"
                            >
                                <NuxtImg
                                    :src="item.imageUrl"
                                    :alt="item.title"
                                    width="168"
                                    height="252"
                                    class="h-full w-full object-cover"
                                />
                                <div
                                    class="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-0 transition-opacity duration-200 group-hover:opacity-100"
                                />
                            </button>
                        </div>

                        <p v-else class="text-xs text-slate-500">
                            Your generated posters will appear here as a quick
                            download history.
                        </p>
                    </div>
                </UCard>
            </section>
        </div>
    </main>
</template>

<style scoped>
.preview-panel-enter-active,
.preview-panel-leave-active {
    transition:
        opacity 0.35s ease,
        transform 0.35s ease;
}

.preview-panel-enter-from,
.preview-panel-leave-to {
    opacity: 0;
    transform: translateY(8px);
}

.steps-list-enter-active,
.steps-list-leave-active {
    transition:
        opacity 0.35s ease,
        transform 0.35s ease;
}

.steps-list-enter-from,
.steps-list-leave-to {
    opacity: 0;
    transform: translateY(10px) scale(0.98);
}

.steps-list-move {
    transition: transform 0.35s ease;
}

.loading-poster-shell {
    background: rgb(2 6 23 / 0.75);
}

.loading-poster-layer {
    position: absolute;
    inset: 0;
    z-index: 10;
    opacity: 0;
    transition: opacity 0.85s ease;
    pointer-events: none;
}

.loading-poster-layer--1 {
    background: radial-gradient(
        120% 85% at 18% 8%,
        rgb(56 189 248 / 0.24),
        rgb(15 23 42 / 0.7) 45%,
        rgb(2 6 23 / 0.9)
    );
}

.loading-poster-layer--2 {
    background: radial-gradient(
        130% 85% at 82% 10%,
        rgb(168 85 247 / 0.24),
        rgb(30 41 59 / 0.72) 45%,
        rgb(2 6 23 / 0.9)
    );
}

.loading-poster-layer--2::after {
    content: "";
    position: absolute;
    inset: 0;
    background-image: repeating-linear-gradient(
        45deg,
        rgb(255 255 255 / 0.02) 0,
        rgb(255 255 255 / 0.02) 1px,
        transparent 1px,
        transparent 9px
    );
    opacity: 0.38;
}

.loading-poster-layer--3 {
    background: radial-gradient(
        120% 90% at 50% 12%,
        rgb(16 185 129 / 0.28),
        rgb(30 41 59 / 0.72) 45%,
        rgb(2 6 23 / 0.9)
    );
}

.loading-poster-layer--3::after {
    content: "";
    position: absolute;
    inset: 0;
    background-image:
        repeating-linear-gradient(
            45deg,
            rgb(255 255 255 / 0.06) 0,
            rgb(255 255 255 / 0.06) 1px,
            transparent 1px,
            transparent 6px
        ),
        repeating-linear-gradient(
            -45deg,
            rgb(255 255 255 / 0.05) 0,
            rgb(255 255 255 / 0.05) 1px,
            transparent 1px,
            transparent 7px
        );
    opacity: 0.82;
}

.loading-poster-layer.is-active {
    opacity: 1;
}

.loading-poster-glow {
    position: absolute;
    inset: -20%;
    z-index: 20;
    background: radial-gradient(
        circle at 30% 15%,
        rgb(56 189 248 / 0.18),
        transparent 42%
    );
    animation: loading-glow-drift 3.6s ease-in-out infinite alternate;
    pointer-events: none;
}

.loading-step-card {
    position: relative;
    border-radius: 0.9rem;
    isolation: isolate;
}

.loading-step-active::before {
    content: "";
    position: absolute;
    inset: -1px;
    border-radius: 1rem;
    background: linear-gradient(
        120deg,
        rgb(34 211 238 / 0.85),
        rgb(52 211 153 / 0.9),
        rgb(59 130 246 / 0.85),
        rgb(34 211 238 / 0.85)
    );
    background-size: 220% 220%;
    animation: active-step-border-flow 2.2s linear infinite;
    z-index: 0;
    opacity: 0.85;
}

.loading-step-content {
    position: relative;
    z-index: 1;
    border-radius: 0.9rem;
    border: 1px solid rgb(51 65 85 / 0.8);
    background: linear-gradient(
        145deg,
        rgb(15 23 42 / 0.95),
        rgb(30 41 59 / 0.88)
    );
    padding: 0.7rem 0.85rem;
    transition: border-color 0.25s ease;
}

.loading-step-active .loading-step-content {
    border-color: rgb(16 185 129 / 0.5);
}

.loading-dots {
    display: inline-block;
    margin-left: 0.1rem;
    line-height: 0.7rem;
    width: 0;
    overflow: hidden;
    white-space: nowrap;
    vertical-align: baseline;
    animation: loading-dots 2s steps(4, end) infinite;
}

@keyframes loading-dots {
    0% {
        width: 0;
    }
    50% {
        width: 1.5ch;
    }
    100% {
        width: 3ch;
    }
}

@keyframes active-step-border-flow {
    0% {
        background-position: 0% 50%;
    }
    50% {
        background-position: 100% 50%;
    }
    100% {
        background-position: 0% 50%;
    }
}

@keyframes loading-glow-drift {
    0% {
        transform: translateX(-4%) translateY(-2%);
        opacity: 0.6;
    }
    100% {
        transform: translateX(6%) translateY(3%);
        opacity: 0.95;
    }
}

.poster-reveal-card {
    transform-style: preserve-3d;
    backface-visibility: hidden;
    animation: poster-idle-shadow 10s ease-in-out infinite 2s;
}

.poster-flip-enter-active {
    transition:
        transform 0.85s cubic-bezier(0.22, 0.88, 0.3, 1),
        opacity 0.65s ease,
        filter 0.85s ease;
}

.poster-flip-enter-from {
    opacity: 0;
    transform: rotateY(-18deg) rotateX(7deg) scale(0.96) translateY(10px);
    filter: blur(2px) saturate(0.8);
}

.poster-flip-enter-to {
    opacity: 1;
    transform: rotateY(0deg) rotateX(0deg) scale(1) translateY(0);
    filter: blur(0) saturate(1);
}

.poster-sheen {
    position: absolute;
    inset: 0;
    background: linear-gradient(
        115deg,
        transparent 34%,
        rgb(255 255 255 / 0.18) 47%,
        rgb(255 255 255 / 0.08) 53%,
        transparent 66%
    );
    transform: translateX(-130%);
    animation: poster-sheen 0.9s ease-out 0.35s 1 forwards;
    pointer-events: none;
}

@keyframes poster-sheen {
    from {
        transform: translateX(-130%);
    }
    to {
        transform: translateX(130%);
    }
}

@keyframes poster-idle-shadow {
    0%,
    60% {
        box-shadow: 0 20px 45px rgb(0 0 0 / 0.6);
    }
    74% {
        box-shadow:
            0 22px 50px rgb(0 0 0 / 0.7),
            0 0 18px rgb(56 189 248 / 0.6);
    }
    100% {
        box-shadow: 0 20px 45px rgb(0 0 0 / 0.6);
    }
}
</style>
