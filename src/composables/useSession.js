import { getCookie, setCookie } from "@/utils/cookie";
import { createSession, validateSession } from "@/services/sessionService";

export async function initSession(type) {
  const getLocation = () => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error("Browser kamu tidak mendukung GPS!"));
      }
      navigator.geolocation.getCurrentPosition(
        (pos) => resolve({ lat: pos.coords.latitude, long: pos.coords.longitude }),
        (err) => {
          switch (err.code) {
            case err.PERMISSION_DENIED:
              reject(
                new Error("Akses ditolak! Mohon aktifkan izin lokasi pada pengaturan browser."),
              );
              break;
            case err.POSITION_UNAVAILABLE:
              reject(
                new Error("Informasi lokasi tidak tersedia. Pastikan GPS HP kamu sudah aktif."),
              );
              break;
            case err.TIMEOUT:
              reject(new Error("Waktu permintaan lokasi sudah habis. Silahkan coba lagi."));
              break;
            default:
              reject(new Error("Terjadi kesalahan pada GPS."));
              break;
          }
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0,
        },
      );
    });
  };

  const cookieName = `session_${type}`;
  let token = getCookie(cookieName);
  try {
    const coords =
      type === "dine-in"
        ? await getLocation()
        : {
            lat: null,
            long: null,
          };

    if (token) {
      try {
        const valid = await validateSession(token);
        if (valid.success) {
          return { success: true, token };
        }
      } catch (err) {
        console.log(err);
        token = null;
      }
    }

    if (!token) {
      const session = await createSession(type, coords);
      token = session.token;

      const expiry = type === "dine-in" ? 30 : 360;
      setCookie(cookieName, token, expiry);
    }

    return {
      success: true,
      token,
    };
  } catch (err) {
    return {
      success: false,
      message: err.response?.data?.message || err.message || "Gagal menginisialisasi sesi.",
    };
  }
}
