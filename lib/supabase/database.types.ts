export type GarmentZone =
  | "cabeca"
  | "casaco"
  | "conjunto"
  | "topo"
  | "inferior"
  | "calcado"
  | "acessorio";

export type ModelPhotoKind = "rosto" | "corpo";

export type LookStatus = "pending" | "processing" | "completed" | "failed";

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          display_name: string;
          slug: string;
          accent_color: string | null;
          created_at: string;
        };
        Insert: {
          id: string;
          display_name: string;
          slug: string;
          accent_color?: string | null;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["profiles"]["Insert"]>;
        Relationships: [];
      };
      model_photos: {
        Row: {
          id: string;
          user_id: string;
          kind: ModelPhotoKind;
          storage_path: string;
          label: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          kind: ModelPhotoKind;
          storage_path: string;
          label?: string | null;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["model_photos"]["Insert"]>;
        Relationships: [];
      };
      garment_photos: {
        Row: {
          id: string;
          user_id: string;
          zone: GarmentZone;
          storage_path: string;
          label: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          zone: GarmentZone;
          storage_path: string;
          label?: string | null;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["garment_photos"]["Insert"]>;
        Relationships: [];
      };
      scene_photos: {
        Row: {
          id: string;
          user_id: string;
          storage_path: string;
          label: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          storage_path: string;
          label: string;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["scene_photos"]["Insert"]>;
        Relationships: [];
      };
      pose_presets: {
        Row: {
          id: string;
          label: string;
          prompt_fragment: string;
          sort_order: number;
          is_active: boolean;
        };
        Insert: {
          id: string;
          label: string;
          prompt_fragment: string;
          sort_order?: number;
          is_active?: boolean;
        };
        Update: Partial<Database["public"]["Tables"]["pose_presets"]["Insert"]>;
        Relationships: [];
      };
      lighting_presets: {
        Row: {
          id: string;
          label: string;
          prompt_fragment: string;
          sort_order: number;
          is_active: boolean;
        };
        Insert: {
          id: string;
          label: string;
          prompt_fragment: string;
          sort_order?: number;
          is_active?: boolean;
        };
        Update: Partial<Database["public"]["Tables"]["lighting_presets"]["Insert"]>;
        Relationships: [];
      };
      expression_presets: {
        Row: { id: string; label: string; prompt_fragment: string; sort_order: number; is_active: boolean };
        Insert: { id: string; label: string; prompt_fragment: string; sort_order?: number; is_active?: boolean };
        Update: Partial<Database["public"]["Tables"]["expression_presets"]["Insert"]>;
        Relationships: [];
      };
      direction_presets: {
        Row: { id: string; label: string; prompt_fragment: string; sort_order: number; is_active: boolean };
        Insert: { id: string; label: string; prompt_fragment: string; sort_order?: number; is_active?: boolean };
        Update: Partial<Database["public"]["Tables"]["direction_presets"]["Insert"]>;
        Relationships: [];
      };
      environment_presets: {
        Row: { id: string; label: string; prompt_fragment: string; sort_order: number; is_active: boolean };
        Insert: { id: string; label: string; prompt_fragment: string; sort_order?: number; is_active?: boolean };
        Update: Partial<Database["public"]["Tables"]["environment_presets"]["Insert"]>;
        Relationships: [];
      };
      hand_presets: {
        Row: { id: string; label: string; prompt_fragment: string; sort_order: number; is_active: boolean };
        Insert: { id: string; label: string; prompt_fragment: string; sort_order?: number; is_active?: boolean };
        Update: Partial<Database["public"]["Tables"]["hand_presets"]["Insert"]>;
        Relationships: [];
      };
      shot_presets: {
        Row: { id: string; label: string; prompt_fragment: string; sort_order: number; is_active: boolean };
        Insert: { id: string; label: string; prompt_fragment: string; sort_order?: number; is_active?: boolean };
        Update: Partial<Database["public"]["Tables"]["shot_presets"]["Insert"]>;
        Relationships: [];
      };
      scene_presets: {
        Row: { id: string; label: string; prompt_fragment: string; sort_order: number; is_active: boolean };
        Insert: { id: string; label: string; prompt_fragment: string; sort_order?: number; is_active?: boolean };
        Update: Partial<Database["public"]["Tables"]["scene_presets"]["Insert"]>;
        Relationships: [];
      };
      hairstyle_presets: {
        Row: { id: string; label: string; prompt_fragment: string; sort_order: number; is_active: boolean };
        Insert: { id: string; label: string; prompt_fragment: string; sort_order?: number; is_active?: boolean };
        Update: Partial<Database["public"]["Tables"]["hairstyle_presets"]["Insert"]>;
        Relationships: [];
      };
      hair_texture_presets: {
        Row: { id: string; label: string; prompt_fragment: string; sort_order: number; is_active: boolean };
        Insert: { id: string; label: string; prompt_fragment: string; sort_order?: number; is_active?: boolean };
        Update: Partial<Database["public"]["Tables"]["hair_texture_presets"]["Insert"]>;
        Relationships: [];
      };
      makeup_presets: {
        Row: { id: string; label: string; prompt_fragment: string; sort_order: number; is_active: boolean };
        Insert: { id: string; label: string; prompt_fragment: string; sort_order?: number; is_active?: boolean };
        Update: Partial<Database["public"]["Tables"]["makeup_presets"]["Insert"]>;
        Relationships: [];
      };
      skin_presets: {
        Row: { id: string; label: string; prompt_fragment: string; sort_order: number; is_active: boolean };
        Insert: { id: string; label: string; prompt_fragment: string; sort_order?: number; is_active?: boolean };
        Update: Partial<Database["public"]["Tables"]["skin_presets"]["Insert"]>;
        Relationships: [];
      };
      looks: {
        Row: {
          id: string;
          user_id: string;
          model_face_photo_id: string;
          model_body_photo_id: string;
          scene_photo_id: string | null;
          scene_preset_id: string | null;
          pose_preset_id: string | null;
          lighting_preset_id: string | null;
          expression_preset_id: string | null;
          direction_preset_id: string | null;
          environment_preset_id: string | null;
          hand_preset_id: string | null;
          shot_preset_id: string | null;
          hairstyle_preset_id: string | null;
          hair_texture_preset_id: string | null;
          makeup_preset_id: string | null;
          skin_preset_id: string | null;
          prompt: string;
          size: string;
          quality: string;
          storage_path: string | null;
          status: LookStatus;
          error_message: string | null;
          created_at: string;
          completed_at: string | null;
        };
        Insert: {
          id?: string;
          user_id: string;
          model_face_photo_id: string;
          model_body_photo_id: string;
          scene_photo_id?: string | null;
          scene_preset_id?: string | null;
          pose_preset_id?: string | null;
          lighting_preset_id?: string | null;
          expression_preset_id?: string | null;
          direction_preset_id?: string | null;
          environment_preset_id?: string | null;
          hand_preset_id?: string | null;
          shot_preset_id?: string | null;
          hairstyle_preset_id?: string | null;
          hair_texture_preset_id?: string | null;
          makeup_preset_id?: string | null;
          skin_preset_id?: string | null;
          prompt: string;
          size?: string;
          quality?: string;
          storage_path?: string | null;
          status?: LookStatus;
          error_message?: string | null;
          created_at?: string;
          completed_at?: string | null;
        };
        Update: Partial<Database["public"]["Tables"]["looks"]["Insert"]>;
        Relationships: [];
      };
      look_garments: {
        Row: {
          id: string;
          look_id: string;
          garment_photo_id: string | null;
          zone: GarmentZone;
          storage_path_snapshot: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          look_id: string;
          garment_photo_id?: string | null;
          zone: GarmentZone;
          storage_path_snapshot: string;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["look_garments"]["Insert"]>;
        Relationships: [];
      };
      preferences: {
        Row: {
          user_id: string;
          default_model_face_photo_id: string | null;
          default_model_body_photo_id: string | null;
          default_scene_photo_id: string | null;
          default_scene_preset_id: string | null;
          default_pose_preset_id: string | null;
          default_lighting_preset_id: string | null;
          default_expression_preset_id: string | null;
          default_direction_preset_id: string | null;
          default_environment_preset_id: string | null;
          default_hand_preset_id: string | null;
          default_shot_preset_id: string | null;
          default_hairstyle_preset_id: string | null;
          default_hair_texture_preset_id: string | null;
          default_makeup_preset_id: string | null;
          default_skin_preset_id: string | null;
          updated_at: string;
        };
        Insert: {
          user_id: string;
          default_model_face_photo_id?: string | null;
          default_model_body_photo_id?: string | null;
          default_scene_photo_id?: string | null;
          default_scene_preset_id?: string | null;
          default_pose_preset_id?: string | null;
          default_lighting_preset_id?: string | null;
          default_expression_preset_id?: string | null;
          default_direction_preset_id?: string | null;
          default_environment_preset_id?: string | null;
          default_hand_preset_id?: string | null;
          default_shot_preset_id?: string | null;
          default_hairstyle_preset_id?: string | null;
          default_hair_texture_preset_id?: string | null;
          default_makeup_preset_id?: string | null;
          default_skin_preset_id?: string | null;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["preferences"]["Insert"]>;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}
