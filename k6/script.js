import http from "k6/http";
import { sleep } from "k6";

export const options = {
  vus: 2000,
  duration: "2m",
};

export default function () {
  http.get("http://test.com");
  sleep(1);
}
