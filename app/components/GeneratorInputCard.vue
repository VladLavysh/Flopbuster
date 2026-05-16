<script setup lang="ts">
import type { SampleReview } from "../shared/types";

interface GenreOption {
    label: string;
    value: string;
}

const props = defineProps<{
    reviewText: string;
    selectedGenre: string;
    isLoading: boolean;
    canGenerate: boolean;
    genreOptions: GenreOption[];
    sampleReviews: SampleReview[];
}>();

const emit = defineEmits<{
    (e: "update:reviewText", value: string): void;
    (e: "update:selectedGenre", value: string): void;
    (e: "generate"): void;
    (e: "loadSample", payload: { text: string; genre: string }): void;
}>();

const reviewModel = computed({
    get: () => props.reviewText,
    set: (value: string) => emit("update:reviewText", value),
});

const genreModel = computed({
    get: () => props.selectedGenre,
    set: (value: string) => emit("update:selectedGenre", value),
});
</script>

<template>
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
                    v-model="reviewModel"
                    :rows="8"
                    autoresize
                    color="neutral"
                    variant="outline"
                    placeholder="The waiter disappeared for 40 minutes and returned with someone elses soup..."
                    class="w-full"
                    maxlength="300"
                />
            </div>

            <div class="space-y-2">
                <label class="text-sm font-medium text-slate-200"
                    >Movie Genre</label
                >
                <USelect
                    v-model="genreModel"
                    :items="genreOptions"
                    default-value="any"
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
                @click="emit('generate')"
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
                        v-for="sample in sampleReviews"
                        :key="sample.title"
                        type="button"
                        class="w-full rounded-xl border border-slate-800 bg-slate-900/80 p-4 text-left transition hover:border-slate-600 hover:bg-slate-800/80"
                        @click="
                            emit('loadSample', {
                                text: sample.text,
                                genre: sample.genre,
                            })
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
                        <p class="line-clamp-2 text-sm text-slate-400">
                            {{ sample.text }}
                        </p>
                    </button>
                </div>
            </div>
        </template>
    </UCard>
</template>
