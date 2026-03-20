export interface Channel {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  videoUrl: string; // URL m3u8 HLS provided by client
  tags: string[];
  category: string;
  isActive: boolean;
  allowedPlanIds: string[]; // plans that can view this channel
  createdAt: string;
  updatedAt: string;
}
