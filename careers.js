const header = document.querySelector("[data-career-header]");
const meter = document.querySelector(".scroll-meter");
const revealItems = document.querySelectorAll(".reveal");
const form = document.querySelector("[data-career-form]");
const statusMessage = document.querySelector("[data-career-status]");
const tiltItems = document.querySelectorAll(".career-tilt");
const hero = document.querySelector(".careers-hero");

const updatePageState = () => {
  const maxScroll = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
  const progress = Math.min(Math.max(window.scrollY / maxScroll, 0), 1);
  const heroProgress = hero
    ? Math.min(Math.max(window.scrollY / Math.max(1, hero.offsetHeight), 0), 1)
    : 0;

  meter.style.transform = `scaleX(${progress})`;
  header.classList.toggle("is-solid", window.scrollY > 40);
  document.body.style.setProperty("--career-scroll", heroProgress.toFixed(4));

  revealItems.forEach((item) => {
    const box = item.getBoundingClientRect();
    if (box.top < window.innerHeight * 0.9 && box.bottom > window.innerHeight * 0.08) {
      item.classList.add("is-visible");
    }
  });
};

const updatePointer = (event) => {
  const x = (event.clientX / window.innerWidth) * 100;
  const y = (event.clientY / window.innerHeight) * 100;

  document.body.style.setProperty("--career-pointer-x", `${x.toFixed(2)}%`);
  document.body.style.setProperty("--career-pointer-y", `${y.toFixed(2)}%`);
};

tiltItems.forEach((item) => {
  item.addEventListener("pointermove", (event) => {
    const box = item.getBoundingClientRect();
    const x = (event.clientX - box.left) / box.width - 0.5;
    const y = (event.clientY - box.top) / box.height - 0.5;

    item.style.setProperty("--tilt-x", `${(x * 5).toFixed(2)}deg`);
    item.style.setProperty("--tilt-y", `${(y * -5).toFixed(2)}deg`);
  });

  item.addEventListener("pointerleave", () => {
    item.style.removeProperty("--tilt-x");
    item.style.removeProperty("--tilt-y");
  });
});

const readApplications = () => {
  try {
    return JSON.parse(window.localStorage.getItem("kimhoangCareerApplications") ?? "[]");
  } catch {
    return [];
  }
};

const saveApplication = (application) => {
  const applications = readApplications();
  applications.push(application);
  window.localStorage.setItem("kimhoangCareerApplications", JSON.stringify(applications.slice(-30)));
};

form?.addEventListener("submit", (event) => {
  event.preventDefault();
  if (!form.reportValidity()) return;

  const formData = new FormData(form);
  const createdAt = new Date();
  const applicationId = `KH-${createdAt.getFullYear()}-${String(createdAt.getTime()).slice(-6)}`;
  const application = {
    id: applicationId,
    createdAt: createdAt.toISOString(),
    fullName: formData.get("fullName")?.toString().trim(),
    birthYear: formData.get("birthYear")?.toString().trim(),
    major: formData.get("major")?.toString().trim(),
    university: formData.get("university")?.toString().trim(),
    phone: formData.get("phone")?.toString().trim(),
    email: formData.get("email")?.toString().trim(),
    position: formData.get("position")?.toString().trim(),
    note: formData.get("note")?.toString().trim()
  };

  saveApplication(application);
  form.reset();

  if (statusMessage) {
    statusMessage.hidden = false;
    statusMessage.textContent = `Kim Hoàng đã nhận thông tin của bạn với mã ${applicationId}. Đội ngũ sẽ xem và liên hệ lại qua số điện thoại hoặc email bạn đã để lại.`;
    statusMessage.scrollIntoView({ behavior: "smooth", block: "center" });
  }
});

window.addEventListener("scroll", updatePageState, { passive: true });
window.addEventListener("pointermove", updatePointer, { passive: true });
window.addEventListener("resize", updatePageState);
window.setTimeout(updatePageState, 80);
