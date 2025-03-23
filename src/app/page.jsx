"use client";

import Layout from "./component/Layout";
import Carosel from "./component/Carosel";
import Terbaru from "./component/Terbaru";
import Authors from "./component/Authors";
import Category from "./component/Category";
import Iklan from "./component/Iklan";
import { useEffect, useState } from "react";
import { UAParser } from "ua-parser-js";

export default function Home() {
  const [ipAddress, setIpAddress] = useState(null);

  useEffect(() => {
    async function trackVisitor() {
      const parser = new UAParser();
      const ua = navigator.userAgent;
      const result = parser.getResult(ua);

      // Dapatkan Alamat IP
      const ipRes = await fetch("/api/ip");
      const ipData = await ipRes.json();
      setIpAddress(ipData.ip);

      const visitorData = {
        device: result.device.type || "desktop",
        browser: result.browser.name,
        os: result.os.name,
        ipAddress: ipData.ip,
        visitTime: [new Date()], // Perubahan di sini
      };

      if (ipData.ip) {
        // Panggil endpoint API untuk menyimpan data pengunjung
        await fetch("/api/visitor", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(visitorData),
        });
      }
    }

    trackVisitor();
  }, [ipAddress]);

  return (
    <Layout>
      <Carosel />
      <Terbaru />
      <Authors />
      <Iklan />
      <Category />
    </Layout>
  );
}
