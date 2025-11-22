
export interface UploadedFile {
  file: File;
  id: string;
}

export interface GeminiServiceParams {
  files?: File[];
  text?: string;
  onProgress?: (progress: number) => void;
  useAdvancedHre?: boolean;
}
