import * as React from "react";

interface WelcomeEmailProps {
  name: string;
  email: string;
}

export function WelcomeEmail({ name, email }: WelcomeEmailProps) {
  const previewText = `Welcome to OPAL-AI, ${name}! Verify your email to get started.`;

  return (
    <html lang="en">
      <head>
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Welcome to OPAL-AI</title>
        {/* Gmail preview text trick */}
        <style>{`
          body { margin: 0; padding: 0; background-color: #0a0a0f; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; }
          table { border-collapse: collapse; }
          img { border: 0; display: block; }
          a { text-decoration: none; }
          @media only screen and (max-width: 600px) {
            .container { width: 100% !important; padding: 16px !important; }
            .heading { font-size: 26px !important; }
            .cta-btn { padding: 14px 28px !important; font-size: 15px !important; }
          }
        `}</style>
      </head>
      <body>
        {/* Inbox preview text */}
        <div
          style={{
            display: "none",
            fontSize: "1px",
            color: "#0a0a0f",
            lineHeight: "1px",
            maxHeight: "0",
            maxWidth: "0",
            opacity: 0,
            overflow: "hidden",
          }}
        >
          {previewText}
          {Array(100).fill("\u200C\u00A0").join("")}
        </div>

        <table
          width="100%"
          cellPadding="0"
          cellSpacing="0"
          style={{ backgroundColor: "#0a0a0f", minHeight: "100vh" }}
        >
          <tbody>
            <tr>
              <td align="center" style={{ padding: "40px 16px" }}>
                {/* Email Card */}
                <table
                  className="container"
                  width="560"
                  cellPadding="0"
                  cellSpacing="0"
                  style={{
                    backgroundColor: "#12121a",
                    borderRadius: "20px",
                    border: "1px solid #1e1e2e",
                    overflow: "hidden",
                  }}
                >
                  <tbody>
                    {/* Header Band */}
                    <tr>
                      <td
                        style={{
                          background:
                            "linear-gradient(135deg, #7c3aed 0%, #a855f7 50%, #ec4899 100%)",
                          padding: "32px 40px",
                          textAlign: "center",
                        }}
                      >
                        {/* Logo */}
                        <table
                          width="100%"
                          cellPadding="0"
                          cellSpacing="0"
                        >
                          <tbody>
                            <tr>
                              <td align="center">
                                <table
                                  cellPadding="0"
                                  cellSpacing="0"
                                >
                                  <tbody>
                                    <tr>
                                      <td
                                        style={{
                                          backgroundColor:
                                            "rgba(255,255,255,0.15)",
                                          borderRadius: "14px",
                                          padding: "14px",
                                          display: "inline-block",
                                        }}
                                      >
                                        {/* Heart SVG Icon */}
                                        <svg
                                          width="32"
                                          height="32"
                                          viewBox="0 0 24 24"
                                          fill="white"
                                          xmlns="http://www.w3.org/2000/svg"
                                        >
                                          <path d="M12 21.593c-5.63-5.539-11-10.297-11-14.402 0-3.791 3.068-5.191 5.281-5.191 1.312 0 4.151.501 5.719 4.457 1.59-3.968 4.464-4.447 5.726-4.447 2.54 0 5.274 1.621 5.274 5.181 0 4.069-5.136 8.625-11 14.402z" />
                                        </svg>
                                      </td>
                                    </tr>
                                  </tbody>
                                </table>
                              </td>
                            </tr>
                            <tr>
                              <td
                                align="center"
                                style={{
                                  paddingTop: "16px",
                                  color: "#ffffff",
                                  fontSize: "28px",
                                  fontWeight: "800",
                                  letterSpacing: "-0.5px",
                                }}
                              >
                                OPAL
                                <span style={{ opacity: 0.75 }}>-AI</span>
                              </td>
                            </tr>
                            <tr>
                              <td
                                align="center"
                                style={{
                                  color: "rgba(255,255,255,0.8)",
                                  fontSize: "13px",
                                  paddingTop: "6px",
                                  letterSpacing: "2px",
                                  textTransform: "uppercase",
                                }}
                              >
                                Organ & Blood Matching Platform
                              </td>
                            </tr>
                          </tbody>
                        </table>
                      </td>
                    </tr>

                    {/* Body */}
                    <tr>
                      <td style={{ padding: "40px 40px 16px" }}>
                        <p
                          style={{
                            margin: "0 0 8px",
                            fontSize: "13px",
                            color: "#a855f7",
                            fontWeight: "600",
                            textTransform: "uppercase",
                            letterSpacing: "1.5px",
                          }}
                        >
                          Welcome aboard
                        </p>
                        <h1
                          className="heading"
                          style={{
                            margin: "0 0 20px",
                            fontSize: "30px",
                            fontWeight: "800",
                            color: "#f0f0ff",
                            lineHeight: "1.3",
                          }}
                        >
                          Hello, {name} 👋
                        </h1>
                        <p
                          style={{
                            margin: "0 0 24px",
                            fontSize: "16px",
                            lineHeight: "1.7",
                            color: "#8888aa",
                          }}
                        >
                          Thank you for joining <strong style={{ color: "#f0f0ff" }}>OPAL-AI</strong> — the
                          AI-powered organ and blood matching platform. We&apos;re thrilled
                          to have you on our life-saving network.
                        </p>
                        <p
                          style={{
                            margin: "0 0 32px",
                            fontSize: "16px",
                            lineHeight: "1.7",
                            color: "#8888aa",
                          }}
                        >
                          To complete your registration and activate your account, please
                          verify your email address by clicking the button below.
                        </p>
                      </td>
                    </tr>

                    {/* CTA Button */}
                    <tr>
                      <td style={{ padding: "0 40px 36px" }} align="center">
                        <table cellPadding="0" cellSpacing="0">
                          <tbody>
                            <tr>
                              <td
                                style={{
                                  background:
                                    "linear-gradient(135deg, #7c3aed, #a855f7)",
                                  borderRadius: "12px",
                                  boxShadow: "0 8px 30px rgba(168, 85, 247, 0.35)",
                                }}
                              >
                                <a
                                  href="#"
                                  className="cta-btn"
                                  style={{
                                    display: "inline-block",
                                    padding: "16px 40px",
                                    color: "#ffffff",
                                    fontSize: "16px",
                                    fontWeight: "700",
                                    letterSpacing: "0.3px",
                                    borderRadius: "12px",
                                  }}
                                >
                                  ✦ &nbsp;Verify My Email Address
                                </a>
                              </td>
                            </tr>
                          </tbody>
                        </table>
                      </td>
                    </tr>

                    {/* Divider */}
                    <tr>
                      <td style={{ padding: "0 40px" }}>
                        <div
                          style={{
                            height: "1px",
                            backgroundColor: "#1e1e2e",
                          }}
                        />
                      </td>
                    </tr>

                    {/* Info Section */}
                    <tr>
                      <td style={{ padding: "28px 40px 32px" }}>
                        <p
                          style={{
                            margin: "0 0 16px",
                            fontSize: "13px",
                            color: "#555570",
                            lineHeight: "1.6",
                          }}
                        >
                          This verification link will expire in{" "}
                          <strong style={{ color: "#8888aa" }}>24 hours</strong>. If you
                          did not create an account on OPAL-AI, you can safely ignore this
                          email — no account will be activated.
                        </p>
                        <p
                          style={{
                            margin: "0",
                            fontSize: "13px",
                            color: "#555570",
                          }}
                        >
                          This email was sent to{" "}
                          <span style={{ color: "#a855f7" }}>{email}</span>
                        </p>
                      </td>
                    </tr>

                    {/* Feature Pills */}
                    <tr>
                      <td
                        style={{
                          padding: "0 40px 36px",
                        }}
                      >
                        <table width="100%" cellPadding="0" cellSpacing="0">
                          <tbody>
                            <tr>
                              <td
                                width="33%"
                                style={{ paddingRight: "8px" }}
                              >
                                <div
                                  style={{
                                    backgroundColor: "#1a1a2e",
                                    borderRadius: "12px",
                                    border: "1px solid #1e1e3a",
                                    padding: "16px 12px",
                                    textAlign: "center",
                                  }}
                                >
                                  <div style={{ fontSize: "22px", marginBottom: "8px" }}>🎯</div>
                                  <div
                                    style={{
                                      fontSize: "12px",
                                      fontWeight: "600",
                                      color: "#c0c0e0",
                                    }}
                                  >
                                    AI Matching
                                  </div>
                                </div>
                              </td>
                              <td
                                width="33%"
                                style={{ paddingLeft: "4px", paddingRight: "4px" }}
                              >
                                <div
                                  style={{
                                    backgroundColor: "#1a1a2e",
                                    borderRadius: "12px",
                                    border: "1px solid #1e1e3a",
                                    padding: "16px 12px",
                                    textAlign: "center",
                                  }}
                                >
                                  <div style={{ fontSize: "22px", marginBottom: "8px" }}>🏥</div>
                                  <div
                                    style={{
                                      fontSize: "12px",
                                      fontWeight: "600",
                                      color: "#c0c0e0",
                                    }}
                                  >
                                    Live Network
                                  </div>
                                </div>
                              </td>
                              <td
                                width="33%"
                                style={{ paddingLeft: "8px" }}
                              >
                                <div
                                  style={{
                                    backgroundColor: "#1a1a2e",
                                    borderRadius: "12px",
                                    border: "1px solid #1e1e3a",
                                    padding: "16px 12px",
                                    textAlign: "center",
                                  }}
                                >
                                  <div style={{ fontSize: "22px", marginBottom: "8px" }}>⚡</div>
                                  <div
                                    style={{
                                      fontSize: "12px",
                                      fontWeight: "600",
                                      color: "#c0c0e0",
                                    }}
                                  >
                                    Real-Time
                                  </div>
                                </div>
                              </td>
                            </tr>
                          </tbody>
                        </table>
                      </td>
                    </tr>

                    {/* Footer */}
                    <tr>
                      <td
                        style={{
                          backgroundColor: "#0e0e18",
                          borderTop: "1px solid #1e1e2e",
                          padding: "24px 40px",
                          textAlign: "center",
                        }}
                      >
                        <p
                          style={{
                            margin: "0 0 8px",
                            fontSize: "12px",
                            color: "#444460",
                          }}
                        >
                          © {new Date().getFullYear()} OPAL-AI. All rights reserved.
                        </p>
                        <p style={{ margin: "0", fontSize: "12px", color: "#444460" }}>
                          <a href="#" style={{ color: "#7c3aed" }}>
                            Privacy Policy
                          </a>{" "}
                          &nbsp;·&nbsp;{" "}
                          <a href="#" style={{ color: "#7c3aed" }}>
                            Unsubscribe
                          </a>
                        </p>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </td>
            </tr>
          </tbody>
        </table>
      </body>
    </html>
  );
}
