/* ========== CONFIG ========== */
/* GitHub username to pull profile + repos */
const GITHUB_USER = "saddamtkg";
const GITHUB_REPO_LIMIT = 6;

/* Formspree endpoint (optional). If empty, contact uses mailto fallback to provided email */
const FORM_ENDPOINT = ""; // e.g. 'https://formspree.io/f/xxxxxx'

/* Fallback contact email (you provided) */
const CONTACT_EMAIL = "saddamhossan.tkg@gmail.com";
/* ============================ */

/* Load DOM references */
const brandAvatar = document.getElementById("brandAvatar");
const heroAvatar = document.getElementById("heroAvatar");
const brandName = document.getElementById("brandName");
const brandRole = document.getElementById("brandRole");
const profileName = document.getElementById("profileName");
const cardName = document.getElementById("cardName");
const cardRole = document.getElementById("cardRole");
const profileBio = document.getElementById("profileBio");
const profileLocation = document.getElementById("profileLocation");
const profileEmail = document.getElementById("profileEmail");
const featuredList = document.getElementById("featuredList");
const techTags = document.getElementById("techTags");
const skillsGrid = document.getElementById("skillsGrid");
const projectsGrid = document.getElementById("projectsGrid");
const socialLinks = document.getElementById("socialLinks");
const downloadCvBtn = document.getElementById("downloadCvBtn");
const downloadFallback = document.getElementById("downloadFallback");

/* Initialize UI: theme, hamburger, smooth scroll, typing, reveal */
(function initUI() {
    // Theme toggle
    const themeToggle = document.getElementById("themeToggle");
    const saved = localStorage.getItem("theme");
    if (saved === "light")
        document.documentElement.setAttribute("data-theme", "light");
    themeToggle?.setAttribute(
        "aria-pressed",
        saved === "light" ? "true" : "false"
    );
    themeToggle?.addEventListener("click", () => {
        const isLight =
            document.documentElement.getAttribute("data-theme") === "light";
        if (isLight) {
            document.documentElement.removeAttribute("data-theme");
            localStorage.setItem("theme", "dark");
            themeToggle.setAttribute("aria-pressed", "false");
        } else {
            document.documentElement.setAttribute("data-theme", "light");
            localStorage.setItem("theme", "light");
            themeToggle.setAttribute("aria-pressed", "true");
        }
    });

    // Hamburger
    const hamburger = document.getElementById("hamburger");
    const navLinks = document.getElementById("navLinks");
    hamburger?.addEventListener("click", () => {
        const expanded = hamburger.getAttribute("aria-expanded") === "true";
        hamburger.setAttribute("aria-expanded", String(!expanded));
        navLinks.style.display = expanded ? "" : "flex";
    });

    // Smooth scroll for internal links
    document.querySelectorAll('a[href^="#"]').forEach((a) => {
        a.addEventListener("click", (e) => {
            const href = a.getAttribute("href");
            if (!href || href === "#") return;
            const target = document.querySelector(href);
            if (target) {
                e.preventDefault();
                target.scrollIntoView({ behavior: "smooth", block: "start" });
                if (window.innerWidth <= 980) {
                    navLinks.style.display = "";
                    hamburger.setAttribute("aria-expanded", "false");
                }
            }
        });
    });

    // Reveal on scroll
    const reveals = document.querySelectorAll(".reveal");
    const io = new IntersectionObserver(
        (entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    entry.target.classList.add("visible");
                    io.unobserve(entry.target);
                }
            });
        },
        { threshold: 0.12 }
    );
    reveals.forEach((r) => io.observe(r));

    // Typing
    startTypewriter();

    // keyboard focus helper
    (function () {
        function handleFirstTab(e) {
            if (e.key === "Tab")
                document.documentElement.classList.add("user-is-tabbing");
        }
        window.addEventListener("keydown", handleFirstTab, { once: true });
    })();
})();

/* Typewriter function */
function startTypewriter() {
    const typeEl = document.getElementById("type");
    const phrases = [
        "beautiful user interfaces",
        "accessible WordPress solutions",
        "fast, maintainable front-end",
        "dynamic JS experiences",
    ];
    let pi = 0,
        ci = 0,
        forward = true;
    (function type() {
        const txt = phrases[pi];
        if (forward) {
            ci++;
            typeEl.textContent = txt.substring(0, ci);
            if (ci === txt.length) {
                forward = false;
                setTimeout(type, 900);
                return;
            }
        } else {
            ci--;
            typeEl.textContent = txt.substring(0, ci);
            if (ci === 0) {
                forward = true;
                pi = (pi + 1) % phrases.length;
            }
        }
        setTimeout(type, forward ? 80 : 35);
    })();
}

/* Populate static skills (you can edit these or load dynamically) */
const SKILLS = [
    { name: "HTML & CSS", pct: 95 },
    { name: "JavaScript", pct: 88 },
    { name: "WordPress (PHP, ACF)", pct: 85 },
    { name: "React", pct: 72 },
];
function renderSkills() {
    skillsGrid.innerHTML = "";
    SKILLS.forEach((s) => {
        const div = document.createElement("div");
        div.className = "skill";
        div.innerHTML = `<div class="skill-head"><span>${escapeHtml(
            s.name
        )}</span><span>${s.pct}%</span></div>
      <div class="bar"><i style="width:${s.pct}%"></i></div>`;
        skillsGrid.appendChild(div);
    });
}
renderSkills();

/* Fill featured list + tech tags defaults */
const FEATURED = [
    "Synced Slider — WP plugin (JS-based synced sliders)",
    "Universal Popup Manager — Plugin with ACF integration",
    "Custom Layout Builder — ACF flexible content patterns",
];
function renderFeatured() {
    featuredList.innerHTML = FEATURED.map(
        (f) => `<li>${escapeHtml(f)}</li>`
    ).join("");
    techTags.innerHTML = [
        "HTML",
        "CSS",
        "JavaScript",
        "React",
        "WordPress",
        "ACF",
    ]
        .map((t) => `<span>${escapeHtml(t)}</span>`)
        .join("");
}
renderFeatured();

/* Social links (replace LinkedIn/Facebook URLs in config if desired) */
function renderSocial() {
    socialLinks.innerHTML = `
    <a aria-label="GitHub" href="https://github.com/${GITHUB_USER}" target="_blank" rel="noreferrer">GitHub</a>
    <a aria-label="LinkedIn" href="https://www.linkedin.com/in/your-linkedin" target="_blank" rel="noreferrer">LinkedIn</a>
    <a aria-label="Facebook" href="https://facebook.com/your-facebook" target="_blank" rel="noreferrer">Facebook</a>
  `;
}
renderSocial();

/* Fetch GitHub profile + repos; populate UI and projects */
async function fetchGithubData() {
    if (!GITHUB_USER) {
        projectsGrid.innerHTML = getFallbackProjectsHtml();
        return;
    }
    try {
        // profile
        const profileRes = await fetch(
            `https://api.github.com/users/${GITHUB_USER}`
        );
        if (profileRes.ok) {
            const profile = await profileRes.json();
            const avatarUrl = profile.avatar_url || "";
            brandAvatar.src = avatarUrl;
            heroAvatar.src = avatarUrl;
            brandName.textContent =
                profile.name || profile.login || "Md Saddam Hossan";
            profileName.textContent =
                profile.name || profile.login || "Md Saddam Hossan";
            cardName.textContent =
                profile.name || profile.login || "Md Saddam Hossan";
            brandRole.textContent = "Front-End & WordPress Developer";
            cardRole.textContent = "Front-End & WordPress Developer";
            profileBio.textContent =
                profile.bio || "Front-end developer and WordPress engineer.";
            profileLocation.textContent =
                profile.location || "Thakurgaon, Bangladesh";
            profileEmail.href = `mailto:${CONTACT_EMAIL}`;
            profileEmail.textContent = CONTACT_EMAIL;
        }

        // repos
        const reposRes = await fetch(
            `https://api.github.com/users/${GITHUB_USER}/repos?sort=updated&per_page=${GITHUB_REPO_LIMIT}`
        );
        if (!reposRes.ok) throw new Error("GitHub repos error");
        const repos = await reposRes.json();
        if (!Array.isArray(repos) || repos.length === 0) {
            projectsGrid.innerHTML = getFallbackProjectsHtml();
            return;
        }
        projectsGrid.innerHTML = repos
            .map((repo) => {
                const name = escapeHtml(repo.name);
                const desc = escapeHtml(repo.description || "Repository");
                const lang = escapeHtml(repo.language || "");
                const stars = repo.stargazers_count || 0;
                const url = repo.html_url;
                return `<article class="project-card">
        <div class="project-head"><h3>${name}</h3><span class="tag">${lang}</span></div>
        <p>${desc}</p>
        <div class="project-actions"><a class="link" href="${url}" target="_blank" rel="noreferrer">View repo</a><span class="muted">⭐ ${stars}</span></div>
      </article>`;
            })
            .join("");
    } catch (err) {
        console.error(err);
        projectsGrid.innerHTML = getFallbackProjectsHtml();
    }
}
fetchGithubData();

/* fallback projects */
function getFallbackProjectsHtml() {
    return `
    <article class="project-card"><div class="project-head"><h3>Synced Slider</h3><span class="tag">Plugin</span></div><p>WordPress plugin with synchronized slider functionality.</p><div class="project-actions"><a class="link" href="#">View</a></div></article>
    <article class="project-card"><div class="project-head"><h3>Universal Popup Manager</h3><span class="tag">Plugin</span></div><p>Popup manager plugin with ACF integration.</p><div class="project-actions"><a class="link" href="#">View</a></div></article>
    <article class="project-card"><div class="project-head"><h3>Custom Layout Builder</h3><span class="tag">Tooling</span></div><p>ACF-powered layout builder for editors.</p><div class="project-actions"><a class="link" href="#">View</a></div></article>
  `;
}

/* Contact form handler: Formspree if endpoint provided, else fallback to mailto */
async function handleContact(e) {
    e.preventDefault();
    const name = document.getElementById("name").value.trim();
    const email = document.getElementById("email").value.trim();
    const message = document.getElementById("message").value.trim();
    if (!name || !email || !message)
        return alert("Please complete all fields.");

    if (FORM_ENDPOINT) {
        try {
            const payload = { name, email, message };
            const res = await fetch(FORM_ENDPOINT, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Accept: "application/json",
                },
                body: JSON.stringify(payload),
            });
            if (!res.ok) throw new Error("Submit failed");
            alert("Message sent — thank you! I will reply soon.");
            document.getElementById("contactForm").reset();
        } catch (err) {
            console.error(err);
            alert(
                "Sorry — something went wrong sending your message. Using mailto fallback."
            );
            mailtoFallback({ name, email, message });
        }
        return false;
    } else {
        mailtoFallback({ name, email, message });
        return false;
    }
}
function mailtoFallback({ name, email, message }) {
    const subject = encodeURIComponent(`Portfolio contact from ${name}`);
    const body = encodeURIComponent(
        `Name: ${name}\nEmail: ${email}\n\n${message}`
    );
    window.location.href = `mailto:${CONTACT_EMAIL}?subject=${subject}&body=${body}`;
}
window.handleContact = handleContact;

/* PDF generation: capture key parts of the portfolio and generate PDF */
downloadCvBtn.addEventListener("click", async () => {
    downloadCvBtn.disabled = true;
    downloadCvBtn.textContent = "Generating PDF...";

    try {
        // Create a shallow clone of the area we want in the CV
        const cvNode = document.createElement("div");
        cvNode.style.width = "900px"; // width for capture
        cvNode.style.padding = "24px";
        cvNode.style.background = "#ffffff";
        cvNode.style.color = "#111827";
        cvNode.style.fontFamily = "Inter, Arial, sans-serif";
        cvNode.style.borderRadius = "8px";

        // Header (name + role)
        const header = document.createElement("div");
        header.innerHTML = `<h1 style="margin:0;font-size:28px">${escapeHtml(
            profileName.textContent || brandName.textContent
        )}</h1>
      <p style="margin:4px 0 10px;color:#374151;font-weight:600">${escapeHtml(
          cardRole.textContent || brandRole.textContent
      )}</p>
      <hr style="border:none;border-top:1px solid #e6eaf0;margin:12px 0">`;
        cvNode.appendChild(header);

        // About
        const aboutSection = document.createElement("div");
        aboutSection.innerHTML = `<h3 style="margin:0 0 6px;font-size:16px">About</h3>
      <p style="margin:0 0 12px;color:#374151">${escapeHtml(
          document.getElementById("aboutText").textContent ||
              profileBio.textContent
      )}</p>`;
        cvNode.appendChild(aboutSection);

        // Skills
        const skillsSection = document.createElement("div");
        skillsSection.innerHTML = `<h3 style="margin:0 0 8px;font-size:16px">Skills</h3>`;
        const skillsList = document.createElement("div");
        skillsList.style.display = "flex";
        skillsList.style.flexWrap = "wrap";
        skillsList.style.gap = "6px";
        SKILLS.forEach((s) => {
            const span = document.createElement("span");
            span.style.padding = "6px 8px";
            span.style.background = "#f3f4f6";
            span.style.color = "#111827";
            span.style.borderRadius = "6px";
            span.style.fontSize = "13px";
            span.textContent = `${s.name} (${s.pct}%)`;
            skillsList.appendChild(span);
        });
        skillsSection.appendChild(skillsList);
        skillsSection.style.marginBottom = "12px";
        cvNode.appendChild(skillsSection);

        // Projects (latest repos loaded into projectsGrid earlier)
        const projectNodes = projectsGrid.querySelectorAll(".project-card");
        const projectsSection = document.createElement("div");
        projectsSection.innerHTML = `<h3 style="margin:0 0 8px;font-size:16px">Recent Projects</h3>`;
        const projectList = document.createElement("div");
        projectList.style.display = "grid";
        projectList.style.gap = "8px";
        if (projectNodes.length) {
            // capture first 6 visible project cards
            for (let i = 0; i < Math.min(6, projectNodes.length); i++) {
                const node = projectNodes[i];
                const title = node.querySelector("h3")?.textContent || "";
                const desc = node.querySelector("p")?.textContent || "";
                const projectItem = document.createElement("div");
                projectItem.innerHTML = `<strong>${escapeHtml(
                    title
                )}</strong><div style="color:#374151">${escapeHtml(
                    desc
                )}</div>`;
                projectList.appendChild(projectItem);
            }
        } else {
            projectList.innerHTML = `<div>No projects available</div>`;
        }
        projectsSection.appendChild(projectList);
        projectsSection.style.marginBottom = "12px";
        cvNode.appendChild(projectsSection);

        // Contact / footer
        const contactSection = document.createElement("div");
        contactSection.innerHTML = `<h3 style="margin:0 0 6px;font-size:16px">Contact</h3>
      <div style="color:#374151">Email: ${escapeHtml(CONTACT_EMAIL)}</div>
      <div style="color:#374151">GitHub: https://github.com/${GITHUB_USER}</div>`;
        cvNode.appendChild(contactSection);

        // Use html2canvas to render the node to canvas, then jsPDF to PDF
        // Ensure global jspdf is available (via CDN)
        const canvas = await html2canvas(cvNode, {
            scale: 2,
            backgroundColor: "#ffffff",
        });
        const imgData = canvas.toDataURL("image/jpeg", 0.95);
        const { jsPDF } = window.jspdf;
        const pdf = new jsPDF({
            orientation: "portrait",
            unit: "pt",
            format: "a4",
        });
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
        pdf.addImage(imgData, "JPEG", 20, 20, pdfWidth - 40, pdfHeight);
        // Save
        pdf.save(`Md_Saddam_Hossan_CV.pdf`);
    } catch (err) {
        console.error(err);
        alert("Could not generate PDF. Please try again.");
    } finally {
        downloadCvBtn.disabled = false;
        downloadCvBtn.textContent = "Download CV (PDF)";
    }
});

/* Helper: escape HTML to avoid injection */
function escapeHtml(str) {
    return str
        ? str.replace(
              /[&<>"'`]/g,
              (c) =>
                  ({
                      "&": "&amp;",
                      "<": "&lt;",
                      ">": "&gt;",
                      '"': "&quot;",
                      "'": "&#39;",
                      "`": "&#x60;",
                  }[c])
          )
        : "";
}

/* Copyright year */
document.getElementById("year").textContent = new Date().getFullYear();
/* End of custom.js */
