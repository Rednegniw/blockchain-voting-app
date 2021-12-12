export interface Candidate {
    id: string;
    name: string;
    photo_url: string;
    description: string;
  }
  
export interface Election {
    id: string;
    candidates: Candidate[];
    start_at: string;
    end_at: string;
  }