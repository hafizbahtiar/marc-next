/**
 * Ralat daripada backend Go. Setiap handler Go menjawab kegagalan dengan
 * `{"error": "mesej dalam Bahasa Melayu"}`, jadi mesej itu boleh dipapar
 * terus kepada ahli - tak perlu jadual terjemahan di sini.
 */
export class ApiError extends Error {
  constructor(
    readonly status: number,
    message: string,
    readonly code?: string,
  ) {
    super(message);
    this.name = "ApiError";
  }

  /** 401 - token tiada/luput/tak sah. Isyarat untuk buang sesi. */
  get isUnauthorized() {
    return this.status === 401;
  }

  /**
   * 403 - token SAH tetapi akaun belum lulus gate. Backend guna kod ini
   * untuk dua keadaan berbeza (RequireApprovedStatus dan
   * RequireVerifiedEmail), jadi ia BUKAN isyarat untuk log keluar; ia
   * isyarat untuk papar skrin status yang betul.
   */
  get isForbidden() {
    return this.status === 403;
  }
}

/** Ralat rangkaian/backend tak dapat dihubungi. */
export class ApiUnreachableError extends Error {
  constructor(cause: unknown) {
    super("Tidak dapat menghubungi pelayan MARC. Cuba sebentar lagi.");
    this.name = "ApiUnreachableError";
    this.cause = cause;
  }
}
