<script setup lang="ts">
import {
    isPollinationsUrl,
    POLLINATIONS_IMAGE_HINT,
} from "#shared/poster-guard";
import type { PosterData, PosterHistoryItem } from "../shared/types";

const posterContainer = ref<HTMLElement | null>(null);

defineExpose({ posterContainer });

const props = defineProps<{
    isLoading: boolean;
    currentLoadingStep: number;
    activeLoadingSteps: string[];
    elapsedSeconds: number;
    posterData: PosterData | null;
    posterHistory: PosterHistoryItem[];
    maxHistory: number;
}>();

const emit = defineEmits<{
    (e: "download"): void;
    (e: "copyLink"): void;
    (e: "loadHistory", item: PosterHistoryItem): void;
}>();

type ImageStatus = "loading" | "ready" | "error";

const imageStatus = ref<ImageStatus>("loading");
const posterImageRef = ref<HTMLImageElement | null>(null);

const showPollinationsHint = computed(
    () =>
        props.posterData?.imageUrl &&
        isPollinationsUrl(props.posterData.imageUrl),
);

watch(
    () => props.posterData?.imageUrl,
    async (url) => {
        if (!url) return;
        imageStatus.value = "loading";
        await nextTick();
        const img = posterImageRef.value;
        if (img?.complete && img.naturalWidth > 0) {
            onPosterImageLoad();
        }
    },
);

function onPosterImageLoad() {
    imageStatus.value = "ready";
}

function onPosterImageError() {
    imageStatus.value = "error";
}
</script>

<template>
    <UCard
        class="border border-slate-800/80 bg-slate-900/70 backdrop-blur"
        :ui="{ body: 'space-y-6' }"
    >
        <template #header>
            <div class="flex items-center gap-3">
                <UIcon name="i-heroicons-film" class="size-5 text-cyan-300" />
                <h2 class="text-lg font-semibold text-white">Poster Preview</h2>
            </div>
        </template>

        <Transition name="preview-panel" mode="out-in">
            <div v-if="isLoading" key="loading" class="space-y-4">
                <div
                    class="loading-poster-shell relative mx-auto aspect-2/3 w-full max-w-sm overflow-hidden rounded-2xl border border-slate-700 shadow-2xl shadow-black/40"
                >
                    <USkeleton class="absolute inset-0 z-0" />

                    <div
                        class="loading-poster-layer loading-poster-layer--1"
                        :class="{ 'is-active': currentLoadingStep === 1 }"
                    />
                    <div
                        class="loading-poster-layer loading-poster-layer--2"
                        :class="{ 'is-active': currentLoadingStep === 2 }"
                    />
                    <div
                        class="loading-poster-layer loading-poster-layer--3"
                        :class="{ 'is-active': currentLoadingStep === 3 }"
                    />

                    <div class="loading-poster-glow" />
                    <div
                        class="absolute left-4 top-4 z-40 rounded-full border border-slate-600/80 bg-slate-900/75 px-3 py-1 text-xs font-medium text-slate-200 backdrop-blur"
                    >
                        Generating: {{ elapsedSeconds }}s
                    </div>
                    <div
                        class="absolute inset-0 z-30 bg-linear-to-b from-slate-950/35 via-slate-900/30 to-slate-950/75"
                    />

                    <div class="absolute inset-x-0 bottom-0 z-40 p-4 sm:p-5">
                        <TransitionGroup
                            name="steps-list"
                            tag="ol"
                            class="space-y-2.5"
                            appear
                        >
                            <li
                                v-for="(step, index) in activeLoadingSteps"
                                :key="step"
                                :class="[
                                    'loading-step-card',
                                    {
                                        'loading-step-active':
                                            index + 1 === currentLoadingStep,
                                    },
                                ]"
                            >
                                <div
                                    class="loading-step-content flex items-start gap-3"
                                >
                                    <div
                                        class="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full border text-xs font-semibold"
                                        :class="
                                            index + 1 <= currentLoadingStep
                                                ? 'border-emerald-400 bg-emerald-500/20 text-emerald-200'
                                                : 'border-slate-700 bg-slate-800 text-slate-400'
                                        "
                                    >
                                        <UIcon
                                            v-if="
                                                index + 1 < currentLoadingStep
                                            "
                                            name="i-heroicons-check"
                                            class="size-4"
                                        />
                                        <span v-else>{{ index + 1 }}</span>
                                    </div>
                                    <p
                                        class="pt-0.5 text-sm"
                                        :class="
                                            index + 1 <= currentLoadingStep
                                                ? 'text-slate-100'
                                                : 'text-slate-500'
                                        "
                                    >
                                        {{ step
                                        }}<span
                                            v-if="
                                                index + 1 === currentLoadingStep
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

            <div v-else-if="posterData" key="success" class="space-y-5">
                <div class="mx-auto w-full max-w-sm space-y-2 perspective-distant">
                    <Transition
                        name="poster-flip"
                        mode="out-in"
                        type="transition"
                        appear
                    >
                        <div
                            :key="posterData.imageUrl"
                            class="group relative aspect-2/3 overflow-hidden rounded-2xl border border-slate-700 bg-slate-950 shadow-2xl shadow-black/60 transition-all duration-300 ease-out hover:-translate-y-1 hover:border-slate-500 hover:shadow-[0_24px_60px_rgba(0,0,0,0.65)]"
                            ref="posterContainer"
                        >
                            <div class="absolute inset-0 z-0">
                                <div
                                    v-if="imageStatus === 'loading'"
                                    class="poster-image-loading absolute inset-0 flex flex-col items-center justify-center gap-3 bg-slate-900"
                                    aria-live="polite"
                                    aria-busy="true"
                                >
                                    <UIcon
                                        name="i-heroicons-photo"
                                        class="size-9 text-slate-500 animate-pulse"
                                    />
                                    <p
                                        class="text-xs font-medium tracking-wide text-slate-400 uppercase"
                                    >
                                        Rendering poster art
                                    </p>
                                </div>

                                <div
                                    v-else-if="imageStatus === 'error'"
                                    class="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-slate-900 p-6 text-center"
                                >
                                    <UIcon
                                        name="i-heroicons-photo"
                                        class="size-10 text-slate-500"
                                    />
                                    <p class="text-sm text-slate-300">
                                        Image still cooking
                                    </p>
                                    <p class="text-xs text-slate-500">
                                        Try refreshing in a moment
                                    </p>
                                </div>

                                <img
                                    ref="posterImageRef"
                                    :src="posterData.imageUrl"
                                    :alt="posterData.title"
                                    width="800"
                                    height="1200"
                                    decoding="async"
                                    class="h-full w-full object-cover transition-all duration-500 ease-out group-hover:scale-[1.03]"
                                    :class="{
                                        'opacity-0': imageStatus !== 'ready',
                                        'opacity-100': imageStatus === 'ready',
                                    }"
                                    @load="onPosterImageLoad"
                                    @error="onPosterImageError"
                                />
                            </div>

                            <div
                                class="pointer-events-none absolute inset-0 z-20 bg-linear-to-t from-black via-black/15 to-transparent"
                            />
                            <div class="poster-sheen z-20" />

                            <div
                                class="pointer-events-none absolute inset-x-0 top-0 z-30 p-5 text-center"
                            >
                                <p
                                    class="mx-auto max-w-1/3 rounded-full border border-white/10 bg-black/40 px-3 py-1 text-xs font-semibold tracking-widest text-white uppercase backdrop-blur-md"
                                >
                                    {{ posterData.releaseDate }}
                                </p>
                            </div>

                            <div
                                class="pointer-events-none absolute inset-x-0 bottom-0 z-30 p-5 text-center"
                            >
                                <p
                                    class="text-[10px] uppercase tracking-[0.4em] text-slate-300"
                                >
                                    A Flopbuster Original
                                </p>
                                <h3
                                    class="mt-2 text-2xl font-extrabold uppercase tracking-[0.16em] text-white sm:text-3xl"
                                >
                                    {{ posterData.title }}
                                </h3>
                                <p
                                    class="mt-3 text-sm italic text-slate-300 sm:text-base"
                                >
                                    "{{ posterData.tagline }}"
                                </p>
                            </div>
                        </div>
                    </Transition>

                    <p
                        v-if="showPollinationsHint"
                        class="flex items-start justify-center gap-2 px-1 text-center text-xs text-slate-400"
                    >
                        <UTooltip :text="POLLINATIONS_IMAGE_HINT">
                            <button
                                type="button"
                                class="mt-0.5 flex shrink-0 text-slate-400 transition hover:text-slate-200"
                                aria-label="About pollinations.ai image loading"
                            >
                                <UIcon
                                    name="i-heroicons-information-circle"
                                    class="size-4"
                                />
                            </button>
                        </UTooltip>
                        <span>
                            Art appears when ready
                        </span>
                    </p>
                </div>

                <div class="flex flex-col gap-3 sm:flex-row">
                    <UButton
                        block
                        color="primary"
                        icon="i-heroicons-arrow-down-tray"
                        @click="emit('download')"
                    >
                        Download Poster
                    </UButton>
                    <UButton
                        block
                        color="neutral"
                        variant="soft"
                        icon="i-heroicons-link"
                        @click="emit('copyLink')"
                    >
                        Copy Image Link
                    </UButton>
                </div>
            </div>

            <div
                v-else
                key="empty"
                class="flex min-h-105 flex-col items-center justify-center rounded-2xl border border-dashed border-slate-700 bg-slate-950/40 p-6 text-center"
            >
                <UIcon
                    name="i-heroicons-photo"
                    class="mb-4 size-10 text-slate-500"
                />
                <p class="text-lg font-semibold text-slate-200">
                    Your blockbuster failure poster will appear here.
                </p>
                <p class="mt-2 max-w-md text-sm text-slate-400">
                    Add a hilariously bad review on the left, choose a genre,
                    and hit Generate Poster.
                </p>
            </div>
        </Transition>

        <div class="border-t border-slate-800/90 pt-4">
            <div class="mb-3 flex items-center gap-2">
                <UIcon name="i-heroicons-clock" class="size-4 text-slate-400" />
                <p class="text-sm font-semibold text-slate-200">
                    Recent Posters ({{ posterHistory.length }}/{{ maxHistory }})
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
                        'group relative h-28 w-21 shrink-0 overflow-hidden rounded-lg border border-slate-700 shadow-lg transition-transform duration-300',
                        index === 0 ? '' : '-ml-5',
                        isLoading
                            ? 'opacity-50'
                            : 'cursor-pointer hover:z-20 hover:scale- hover:border-slate-500',
                    ]"
                    :style="{ transform: `scale(${1 + index * 0.015})` }"
                    :title="`Load ${item.title}`"
                    :disabled="isLoading"
                    @click="emit('loadHistory', item)"
                >
                    <NuxtImg
                        :src="item.imageUrl"
                        :alt="item.title"
                        width="168"
                        height="252"
                        class="h-full w-full object-cover"
                    />
                    <div
                        class="absolute inset-0 bg-linear-to-t from-black/60 via-black/20 to-transparent opacity-0 transition-opacity duration-200 group-hover:opacity-100"
                    />
                </button>
            </div>

            <p v-else class="text-xs text-slate-500">
                Your generated posters will appear here as a quick download
                history.
            </p>
        </div>
    </UCard>
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
        transform 0.65s cubic-bezier(0.22, 0.88, 0.3, 1),
        opacity 0.45s ease,
        filter 0.65s ease;
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

.poster-flip-leave-active {
    transition:
        opacity 0.18s ease,
        transform 0.18s ease;
}

.poster-flip-leave-from {
    opacity: 1;
    transform: scale(1);
}

.poster-flip-leave-to {
    opacity: 0;
    transform: scale(0.985);
}

.poster-image-loading::before {
    content: "";
    position: absolute;
    inset: 0;
    background: linear-gradient(
        105deg,
        transparent 38%,
        rgb(148 163 184 / 0.12) 48%,
        rgb(148 163 184 / 0.2) 52%,
        transparent 62%
    );
    background-size: 220% 100%;
    animation: poster-image-shimmer 1.8s ease-in-out infinite;
}

@keyframes poster-image-shimmer {
    0% {
        background-position: 120% 0;
    }
    100% {
        background-position: -120% 0;
    }
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
