export type PexelsPhoto = {
  id: number;
  width: number;
  height: number;
  url: string;
  photographer: string;
  photographer_url: string;
  src: {
    medium: string;
    large: string;
  };
};

export type PexelsResponse = {
  page: number;
  per_page: number;
  photos: PexelsPhoto[];
  total_results?: number;
  next_page?: string;
  prev_page?: string;
};

export type Favorite = {
  id: string;
  user_id: string;
  pexels_photo_id: number;
  url: string;
  photographer: string;
  created_at: string;
};
