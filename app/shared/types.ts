export type Genre =
  | "any"
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

export interface PosterData {
  title: string;
  tagline: string;
  releaseDate: string;
  imageUrl: string;
  reviewText: string;
  genre: Genre;
}

export interface PosterHistoryItem extends PosterData {
  id: number;
  reviewText: string;
  genre: Genre;
}

export interface SampleReview {
  title: string;
  text: string;
  genre: string;
}
