import { getCookie, setCookie } from "@/utils/cookie";
import { createSession, validateSession } from "@/services/sessionService";

export async function initSession(type) {
  let token = getCookie("session_token");

  if (!token) {
    const session = await createSession(type);

    token = session.token;

    const minute = type === "dinein" ? 30 : 360;

    setCookie("session_token", token, minute);
  }

  const valid = await validateSession(token);

  if (!valid.success) {
    const session = await createSession(type);

    token = session.token;
  }

  return token;
}
