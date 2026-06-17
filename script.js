const header = document.querySelector("[data-header]");
const meter = document.querySelector(".scroll-meter");
const premiere = document.querySelector("[data-premiere]");
const premiereSkip = document.querySelector("[data-premiere-skip]");
const preloadStatus = document.querySelector("[data-preload-status]");
const hero = document.querySelector(".hero");
const reveals = document.querySelectorAll(".reveal");
const story = document.querySelector("[data-story]");
const stageImages = document.querySelectorAll("[data-stage-image]");
const stageCount = document.querySelector("[data-stage-count]");
const stageTitle = document.querySelector("[data-stage-title]");
const stageDots = document.querySelectorAll("[data-stage-dot]");
const storyProgress = document.querySelector("[data-story-progress]");
const storyPercent = document.querySelector("[data-story-percent]");
const storyCanvas = document.querySelector("[data-story-canvas]");
const storyCompositor = document.querySelector("[data-story-compositor]");
const storyScenes = document.querySelectorAll("[data-story-scene]");
const chapters = storyScenes.length ? storyScenes : document.querySelectorAll("[data-stage]");
const cinematicItems = document.querySelectorAll("[data-cinematic]");
const languageButtons = document.querySelectorAll("[data-lang]");
const metaDescription = document.querySelector("meta[name='description']");
const articleReader = document.querySelector("[data-article-reader]");
const articleCards = document.querySelectorAll("[data-article-card]");
const articleOpen = document.querySelector("[data-article-open]");
const articleModal = document.querySelector("[data-article-modal]");
const articleCloseButtons = document.querySelectorAll("[data-article-close]");
const navLinks = document.querySelectorAll(".main-nav a[href^='#']");
const navTargets = Array.from(navLinks, (link) => {
  const id = link.getAttribute("href")?.slice(1);
  return {
    id,
    link,
    section: id ? document.getElementById(id) : null
  };
}).filter((item) => item.section);
let activeStage = "0";
let ticking = false;
let renderedStoryProgress = 0;
let lastStoryPercent = -1;
let lastStoryCanvasIndex = -1;
let lastStoryLayerIndex = -1;
let lastStoryTextIndex = -1;
let storyIndex = 0;
let activeArticleCard = articleCards[0] ?? null;
const articleImageCache = new Map();
let storyTransitionFrame = 0;
let storyTransitionTimer = 0;
let storyTransitioning = false;
let storyScrollLockUntil = 0;
let storyWheelDelta = 0;
let storyExitHoldDelta = 0;
let storyExitHoldReleased = false;
let storyExitHoldUntil = 0;
let storyTouchStartX = 0;
let storyTouchStartY = 0;
let storyTouchHandled = false;
let didUnlockPremiere = false;
let storyCanvasContext = null;
let storyCanvasReady = false;
let storyCompositorReady = false;
let lastCanvasWidth = 0;
let lastCanvasHeight = 0;
const storyCanvasImages = [];
const storyImageLayers = [];
const storyTransitionDuration = 820;
const storyTextEnterDelay = 360;
const storyGestureThreshold = 54;
const storyExitHoldDuration = 920;
const storyExitHoldThreshold = 180;
const storyExitHoldSteps = 0.72;

const layoutMetrics = {
  maxScroll: 0,
  heroHeight: 1,
  storyTop: 0,
  storyHeight: 0,
  nav: []
};

const clamp01 = (value) => Math.min(Math.max(value, 0), 1);
const easeOutCubic = (value) => 1 - Math.pow(1 - clamp01(value), 3);
const easeInOutCubic = (value) => {
  const t = clamp01(value);
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
};

const supportedLanguages = ["vi", "en", "zh", "es"];
const languageMeta = {
  vi: { htmlLang: "vi" },
  en: { htmlLang: "en" },
  zh: { htmlLang: "zh-Hans" },
  es: { htmlLang: "es" }
};

const translations = {
  vi: {
    "meta.title": "Kim Hoàng | Dữ liệu đất đai & lâm nghiệp",
    "meta.description": "Giao diện giới thiệu hiện đại cho Công ty TNHH MTV Kim Hoàng trong lĩnh vực đo đạc, dữ liệu đất đai và lâm nghiệp.",
    "premiere.kicker": "Dữ liệu đất đai. Bản đồ. Lâm nghiệp.",
    "premiere.headline": "Mở ra một cách nhìn rõ hơn về quản lý địa phương.",
    "premiere.loading": "Đang chuẩn bị hình ảnh {percent}%",
    "premiere.ready": "Sẵn sàng",
    "premiere.optimized": "Mở trải nghiệm tối ưu",
    "premiere.skip": "Vào trang",
    "nav.label": "Điều hướng chính",
    "nav.capabilities": "Năng lực",
    "nav.story": "Hành trình",
    "nav.projects": "Dự án",
    "nav.partners": "Đối tác",
    "nav.careers": "Tuyển dụng",
    "nav.insights": "Bài viết",
    "nav.contact": "Liên hệ",
    "hero.kicker": "Đo đạc. Dữ liệu. Lâm nghiệp.",
    "hero.headline": "Biến dữ liệu đất đai thành nền tảng quản lý rõ ràng hơn.",
    "hero.lede": "Kim Hoàng đồng hành cùng cơ quan, địa phương và doanh nghiệp trong đo đạc địa chính, xây dựng cơ sở dữ liệu đất đai và tư vấn lâm nghiệp, với cách làm chính xác, có hệ thống và dễ kiểm chứng.",
    "hero.primary": "Xem hành trình",
    "hero.secondary": "Kết nối dự án",
    "hero.stat": "năm bền bỉ cùng dữ liệu địa phương",
    "overview.item1.title": "15+ năm dữ liệu địa phương",
    "overview.item1.text": "Kinh nghiệm triển khai cùng hồ sơ đất đai, bản đồ và dữ liệu quản lý.",
    "overview.item2.title": "Đo đạc, bản đồ, cơ sở dữ liệu",
    "overview.item2.text": "Từ hiện trường đến hệ thống vận hành, mỗi lớp thông tin đều có mục đích.",
    "overview.item3.title": "AI, OCR và tự động hóa",
    "overview.item3.text": "Công nghệ được đặt vào kiểm tra dữ liệu, nhận dạng tài liệu và giảm thao tác lặp.",
    "overview.item4.title": "Không gian cho sinh viên thực tập",
    "overview.item4.text": "Nhìn thấy dự án thật, chọn hướng phù hợp và gửi thông tin ứng tuyển nhanh.",
    "overview.item4.action": "Đăng ký thực tập",
    "ticker.overview.1": "15+ năm dữ liệu địa phương",
    "ticker.overview.2": "Đo đạc, bản đồ, cơ sở dữ liệu",
    "ticker.overview.3": "AI, OCR và tự động hóa",
    "ticker.overview.4": "Không gian cho sinh viên thực tập",
    "ticker.intro.1": "Rõ hiện trạng",
    "ticker.intro.2": "Rõ ranh giới",
    "ticker.intro.3": "Rõ hồ sơ",
    "ticker.intro.4": "Rõ dữ liệu vận hành",
    "ticker.internship.1": "Thực tập từ dự án thật",
    "ticker.internship.2": "Hồ sơ, bản đồ và dữ liệu thật",
    "ticker.internship.3": "Tiếp cận AI workflow",
    "ticker.internship.4": "Gửi thông tin ứng tuyển nhanh",
    "ticker.capabilities.1": "Khảo sát và đo đạc",
    "ticker.capabilities.2": "Chuẩn hóa hồ sơ địa chính",
    "ticker.capabilities.3": "Cơ sở dữ liệu đất đai",
    "ticker.capabilities.4": "Lâm nghiệp gắn địa bàn",
    "ticker.story.1": "Nâng chuẩn đội ngũ",
    "ticker.story.2": "Dữ liệu vận hành lâu dài",
    "ticker.story.3": "Dự án trọng điểm",
    "ticker.story.4": "15 năm phát triển",
    "ticker.projects.1": "Ảnh thật, bối cảnh thật",
    "ticker.projects.2": "Tuyến công trình quy mô lớn",
    "ticker.projects.3": "Dữ liệu dễ kiểm tra",
    "ticker.projects.4": "Bàn giao rõ trách nhiệm",
    "ticker.partners.1": "Đào tạo và chuyên môn",
    "ticker.partners.2": "Hạ tầng giao thông",
    "ticker.partners.3": "Năng lượng và tuyến công trình",
    "ticker.partners.4": "Hệ sinh thái triển khai rộng hơn",
    "ticker.careers.1": "Thực tập sinh và sinh viên mới",
    "ticker.careers.2": "Môi trường dự án thật",
    "ticker.careers.3": "AI, OCR và tự động hóa",
    "ticker.careers.4": "Đăng ký ứng tuyển nhanh",
    "ticker.insights.1": "Tin tức công nghệ và đào tạo",
    "ticker.insights.2": "Dự án có bối cảnh rõ",
    "ticker.insights.3": "Tài liệu chuyên môn dễ đọc",
    "ticker.insights.4": "Chọn bài mượt trong cùng trang",
    "marquee.item1": "15+ năm dữ liệu địa phương",
    "marquee.item2": "Đo đạc địa chính",
    "marquee.item3": "Cơ sở dữ liệu đất đai",
    "marquee.item4": "Lâm nghiệp gắn địa bàn",
    "marquee.item5": "Dự án hạ tầng quy mô lớn",
    "marquee.item6": "AI, OCR & tự động hóa",
    "marquee.item7": "Hồ sơ rõ, dữ liệu chắc",
    "marquee.item8": "Đồng hành cùng cơ quan và địa phương",
    "process.item1": "Tiếp nhận bối cảnh",
    "process.item2": "Khảo sát hiện trường",
    "process.item3": "Đo vẽ bản đồ",
    "process.item4": "Chuẩn hóa hồ sơ",
    "process.item5": "Kiểm tra thuộc tính",
    "process.item6": "Xây dựng dữ liệu",
    "process.item7": "Bàn giao dễ tra cứu",
    "process.item8": "Cập nhật theo nhu cầu quản lý",
    "proof.item1": "Ảnh thật",
    "proof.item2": "Bối cảnh thật",
    "proof.item3": "Tuyến công trình",
    "proof.item4": "Lớp dữ liệu",
    "proof.item5": "Hồ sơ địa chính",
    "proof.item6": "Vai trò triển khai",
    "proof.item7": "Nghiệm thu rõ ràng",
    "proof.item8": "Giá trị sử dụng lâu dài",
    "connect.item1": "Tin tức",
    "connect.item2": "Tài liệu chuyên môn",
    "connect.item3": "Câu chuyện đào tạo",
    "connect.item4": "Ứng dụng AI",
    "connect.item5": "Tuyển dụng",
    "connect.item6": "Trao đổi dự án",
    "connect.item7": "Dữ liệu địa phương",
    "connect.item8": "Kim Hoàng 2026",
    "intro.kicker": "Nền tảng cho quản lý hiện đại",
    "intro.headline": "Dữ liệu rõ ràng tạo ra quyết định nhanh hơn, hồ sơ chắc hơn và cách quản lý minh bạch hơn.",
    "intro.signal1.title": "Địa chính chính xác",
    "intro.signal1.text": "Hiện trạng, ranh giới, bản đồ và hồ sơ được chuẩn hóa thành một nguồn dữ liệu đáng tin.",
    "intro.signal2.title": "Dữ liệu sẵn sàng vận hành",
    "intro.signal2.text": "Cơ sở dữ liệu được tổ chức để tra cứu, cập nhật, báo cáo và mở rộng khi nhu cầu quản lý thay đổi.",
    "intro.signal3.title": "Lâm nghiệp gắn địa bàn",
    "intro.signal3.text": "Tư vấn và triển khai dự án dựa trên dữ liệu nền, pháp lý và đặc điểm thực tế của từng khu vực.",
    "internship.kicker": "Thực tập & sinh viên mới",
    "internship.headline": "Một nơi để nhìn thấy công việc thật trước khi chọn hướng đi lâu dài.",
    "internship.text": "Kim Hoàng phù hợp với sinh viên muốn hiểu ngành quản lý đất đai, trắc địa, bản đồ và dữ liệu từ các dự án đang vận hành, thay vì chỉ đọc mô tả công việc trên giấy.",
    "internship.primary": "Đăng ký thực tập",
    "internship.secondary": "Xem dự án thật",
    "internship.card1.title": "Học từ hồ sơ, bản đồ và dữ liệu thật.",
    "internship.card1.text": "Sinh viên được nhìn thấy cách dữ liệu ngoài thực địa đi vào hồ sơ, hệ thống và quy trình bàn giao.",
    "internship.card2.title": "Tiếp cận AI, OCR và tự động hóa.",
    "internship.card2.text": "Công nghệ được đặt vào nghiệp vụ cụ thể: nhận dạng tài liệu, kiểm tra dữ liệu và giảm thao tác lặp.",
    "internship.card3.title": "Đi từ quan sát đến tham gia từng phần việc rõ ràng.",
    "internship.card3.text": "Lộ trình phù hợp cho người mới: hiểu bối cảnh, chọn hướng chuyên môn, gửi thông tin và được trao đổi trực tiếp.",
    "cap.kicker": "Năng lực triển khai",
    "cap.headline": "Từ khảo sát hiện trường đến hệ thống dữ liệu, mọi lớp thông tin đều có mục đích.",
    "cap.row1.kicker": "Khảo sát & đo đạc",
    "cap.row1.title": "Đo đúng hiện trạng, chuẩn hóa đúng hồ sơ.",
    "cap.row1.text": "Kim Hoàng biến dữ liệu ngoài thực địa thành bản đồ, hồ sơ và tài liệu bàn giao có cấu trúc, giúp quá trình quản lý minh bạch hơn.",
    "cap.row2.kicker": "Chuyển đổi số đất đai",
    "cap.row2.title": "Cơ sở dữ liệu có thể tra cứu, quản lý và mở rộng.",
    "cap.row2.text": "Dữ liệu được thu thập, rà soát, chuẩn hóa và tổ chức theo hệ thống để phục vụ vận hành lâu dài, không chỉ dừng ở một bộ hồ sơ.",
    "cap.row3.kicker": "Lâm nghiệp & địa phương",
    "cap.row3.title": "Tư vấn gắn với hiện trạng, pháp lý và mục tiêu phát triển.",
    "cap.row3.text": "Các dự án lâm nghiệp được tiếp cận từ dữ liệu nền, hồ sơ pháp lý và nhu cầu thực tế của địa phương để tạo ra phương án khả thi.",
    "story.meter": "Hành trình Kim Hoàng",
    "story.stage1.label": "Nâng chuẩn đội ngũ",
    "story.stage1.title": "Tri thức mới đi vào quy trình, không dừng ở phong trào.",
    "story.stage1.text": "Kim Hoàng cập nhật công nghệ, đào tạo con người và đưa tư duy dữ liệu vào từng bước triển khai để chất lượng dự án ổn định hơn.",
    "story.stage1.point1": "Đào tạo nội bộ theo nhu cầu dự án",
    "story.stage1.point2": "Ứng dụng công nghệ để giảm thao tác lặp",
    "story.stage1.point3": "Kiểm soát chất lượng trước khi bàn giao",
    "story.stage2.label": "Dữ liệu vận hành",
    "story.stage2.title": "Từ bản đồ, hồ sơ đến cơ sở dữ liệu: mọi thứ phải khớp và dễ truy xuất.",
    "story.stage2.text": "Dữ liệu được rà soát, chuẩn hóa và tổ chức thành một nền tảng có thể phục vụ quản lý lâu dài, không chỉ dùng cho một lần nghiệm thu.",
    "story.stage2.point1": "Chuẩn hóa lớp thông tin và thuộc tính",
    "story.stage2.point2": "Tối ưu cho tra cứu, cập nhật và báo cáo",
    "story.stage2.point3": "Bàn giao rõ cấu trúc, rõ trách nhiệm",
    "story.stage3.label": "Dự án trọng điểm",
    "story.stage3.title": "Khi nhiều bên cùng phối hợp, dữ liệu phải nói cùng một ngôn ngữ.",
    "story.stage3.text": "Với các dự án hạ tầng và quản lý địa bàn, cách tổ chức dữ liệu quyết định tốc độ phối hợp, rà soát và xử lý phát sinh.",
    "story.stage3.point1": "Thông tin dự án được sắp xếp theo bối cảnh",
    "story.stage3.point2": "Vai trò triển khai rõ ràng theo từng giai đoạn",
    "story.stage3.point3": "Kết quả bàn giao dễ kiểm tra và đối chiếu",
    "story.stage4.label": "15 năm phát triển",
    "story.stage4.title": "Kinh nghiệm lâu năm, cách phục vụ mới và hình ảnh đáng tin hơn.",
    "story.stage4.text": "Kim Hoàng giữ lại sự chắc chắn đã xây dựng nhiều năm, đồng thời làm mới cách giao tiếp để khách hàng cảm nhận năng lực nhanh hơn.",
    "story.stage4.point1": "Thông điệp ngắn, rõ và có trọng tâm",
    "story.stage4.point2": "Hình ảnh thật, ưu tiên độ tin cậy",
    "story.stage4.point3": "Trải nghiệm mượt trên desktop và mobile",
    "projects.kicker": "Dự án tiêu biểu",
    "projects.headline": "Ảnh thật, bối cảnh thật, năng lực triển khai được kể như một bộ phim ngắn.",
    "projects.text": "Mỗi dự án được đặt trong một khung hình lớn để người xem cảm nhận ngay quy mô, vai trò và kết quả mà Kim Hoàng mang lại.",
    "projects.item1.kicker": "Dự án hạ tầng",
    "projects.item1.title": "Dữ liệu phục vụ những tuyến công trình quy mô lớn.",
    "projects.item1.text": "Tổ chức thông tin tuyến, hiện trạng và hồ sơ liên quan để quá trình phối hợp, rà soát và bàn giao diễn ra rõ ràng hơn.",
    "projects.item2.kicker": "Chuyển đổi số",
    "projects.item2.title": "Đưa nghiệp vụ địa chính vào một cấu trúc dữ liệu dễ vận hành.",
    "projects.item2.text": "Dữ liệu được chuẩn hóa theo lớp thông tin, thuộc tính và quy trình kiểm tra để phục vụ quản lý lâu dài.",
    "projects.item3.kicker": "15 năm phát triển",
    "projects.item3.title": "Một nền tảng tin cậy được xây bằng kinh nghiệm và kỷ luật triển khai.",
    "projects.item3.text": "Kim Hoàng làm mới cách xuất hiện, nhưng giữ nguyên giá trị cốt lõi: chắc chắn, tận tâm và có trách nhiệm với dữ liệu bàn giao.",
    "partners.kicker": "Đối tác",
    "partners.headline": "Những mối quan hệ làm rõ hơn năng lực triển khai của Kim Hoàng.",
    "partners.text": "Từ đào tạo chuyên môn, hạ tầng giao thông đến năng lượng, các đối tác xuất hiện như một lớp bằng chứng ngắn gọn cho kinh nghiệm làm việc cùng nhiều hệ sinh thái khác nhau.",
    "partners.item1": "Đào tạo & chuyên môn",
    "partners.item2": "Hạ tầng giao thông",
    "partners.item3": "Năng lượng & tuyến công trình",
    "careers.kicker": "Tuyển dụng",
    "careers.headline": "Dành riêng cho những ứng viên muốn làm việc cùng dữ liệu thật.",
    "careers.text": "Trang tuyển dụng được tách thành một không gian riêng để ứng viên hiểu nhanh về Kim Hoàng, chọn hướng phù hợp và gửi thông tin cơ bản để đội ngũ nhân sự liên hệ lại.",
    "careers.action": "Vào trang tuyển dụng",
    "insights.kicker": "Tin tức, dự án & tài liệu",
    "insights.headline": "Những câu chuyện giúp người đọc hiểu rõ hơn cách Kim Hoàng làm việc.",
    "insights.text": "Tin tức, dự án và tài liệu chuyên môn được đặt trong cùng một không gian đọc: rõ bối cảnh, dễ chọn bài và đủ mềm để người xem tiếp tục khám phá.",
    "insights.item1.title": "Quy trình xây dựng Cơ sở dữ liệu đất đai",
    "insights.item1.text": "Từ hồ sơ, bản đồ đến dữ liệu vận hành có cấu trúc.",
    "insights.item2.title": "Luật đất đai năm 2024",
    "insights.item2.text": "Nền tảng pháp lý để dự án được triển khai đúng hướng.",
    "insights.item3.title": "Ứng dụng CNTT trong công tác địa chính",
    "insights.item3.text": "Chuẩn hóa thao tác, rút ngắn tra cứu và giảm rủi ro sai lệch.",
    "contact.kicker": "Liên hệ",
    "contact.headline": "Bắt đầu một dự án dữ liệu rõ ràng hơn.",
    "contact.text": "Kim Hoàng sẵn sàng trao đổi về đo đạc, cơ sở dữ liệu đất đai, lâm nghiệp và các bài toán quản lý tại địa phương.<br />Số 1537 đường Hoàng Hoa Thám, phường Đa Mai, tỉnh Bắc Ninh<br />0240.352.0375 | support@kimhoang.vn",
    "contact.action": "Gửi thông tin",
    "footer.credit": "Thiết kế & phát triển trải nghiệm bởi Kim Nhật Hoàng · 2026",
    "footer.back": "Trở về đầu trang"
  },
  en: {
    "meta.title": "Kim Hoang | Land & Forestry Data",
    "meta.description": "A modern company profile for Kim Hoang, focused on surveying, land data systems and forestry consulting.",
    "premiere.kicker": "Land data. Mapping. Forestry.",
    "premiere.headline": "Opening a clearer way to manage local information.",
    "premiere.loading": "Preparing imagery {percent}%",
    "premiere.ready": "Ready",
    "premiere.optimized": "Opening the optimized experience",
    "premiere.skip": "Enter site",
    "nav.label": "Primary navigation",
    "nav.capabilities": "Capabilities",
    "nav.story": "Journey",
    "nav.projects": "Projects",
    "nav.partners": "Partners",
    "nav.careers": "Careers",
    "nav.insights": "Articles",
    "nav.contact": "Contact",
    "hero.kicker": "Surveying. Data. Forestry.",
    "hero.headline": "Turning land data into a clearer management foundation.",
    "hero.lede": "Kim Hoang works with agencies, local authorities and enterprises on cadastral surveying, land database development and forestry consulting, with a method that is precise, systematic and easy to verify.",
    "hero.primary": "Explore the journey",
    "hero.secondary": "Start a project",
    "hero.stat": "years building local data with discipline",
    "overview.item1.title": "15+ years of local data",
    "overview.item1.text": "Experience across land records, mapping and management data.",
    "overview.item2.title": "Surveying, maps and databases",
    "overview.item2.text": "From field work to operating systems, every layer of information has a purpose.",
    "overview.item3.title": "AI, OCR and automation",
    "overview.item3.text": "Technology supports data checking, document recognition and fewer repeated tasks.",
    "overview.item4.title": "A place for student interns",
    "overview.item4.text": "See real projects, choose a suitable direction and submit your information quickly.",
    "overview.item4.action": "Apply for internship",
    "ticker.overview.1": "15+ years of local data",
    "ticker.overview.2": "Surveying, maps and databases",
    "ticker.overview.3": "AI, OCR and automation",
    "ticker.overview.4": "A place for student interns",
    "ticker.intro.1": "Clear current conditions",
    "ticker.intro.2": "Clear boundaries",
    "ticker.intro.3": "Clear records",
    "ticker.intro.4": "Operational data clarity",
    "ticker.internship.1": "Internships from real projects",
    "ticker.internship.2": "Real records, maps and data",
    "ticker.internship.3": "Exposure to AI workflows",
    "ticker.internship.4": "Fast internship submission",
    "ticker.capabilities.1": "Surveying and measurement",
    "ticker.capabilities.2": "Cadastral record standardization",
    "ticker.capabilities.3": "Land database systems",
    "ticker.capabilities.4": "Forestry tied to local context",
    "ticker.story.1": "Raising team standards",
    "ticker.story.2": "Data built for long-term operation",
    "ticker.story.3": "Key projects",
    "ticker.story.4": "15 years of development",
    "ticker.projects.1": "Real imagery, real context",
    "ticker.projects.2": "Large-scale linear infrastructure",
    "ticker.projects.3": "Data that is easy to verify",
    "ticker.projects.4": "Clear handover responsibility",
    "ticker.partners.1": "Training and expertise",
    "ticker.partners.2": "Transport infrastructure",
    "ticker.partners.3": "Energy and linear projects",
    "ticker.partners.4": "A wider delivery ecosystem",
    "ticker.careers.1": "Interns and early talent",
    "ticker.careers.2": "A real project environment",
    "ticker.careers.3": "AI, OCR and automation",
    "ticker.careers.4": "Quick application submission",
    "ticker.insights.1": "Technology and training news",
    "ticker.insights.2": "Projects with clear context",
    "ticker.insights.3": "Readable professional resources",
    "ticker.insights.4": "Smooth article selection on-page",
    "marquee.item1": "15+ years of local data",
    "marquee.item2": "Cadastral surveying",
    "marquee.item3": "Land database systems",
    "marquee.item4": "Forestry grounded in local context",
    "marquee.item5": "Large-scale infrastructure projects",
    "marquee.item6": "AI, OCR & automation",
    "marquee.item7": "Clear records, solid data",
    "marquee.item8": "Working with agencies and local authorities",
    "process.item1": "Context intake",
    "process.item2": "Field survey",
    "process.item3": "Mapping",
    "process.item4": "Record standardization",
    "process.item5": "Attribute verification",
    "process.item6": "Data construction",
    "process.item7": "Search-ready handover",
    "process.item8": "Updates for management needs",
    "proof.item1": "Real imagery",
    "proof.item2": "Real context",
    "proof.item3": "Linear infrastructure",
    "proof.item4": "Data layers",
    "proof.item5": "Cadastral records",
    "proof.item6": "Delivery roles",
    "proof.item7": "Clear acceptance",
    "proof.item8": "Long-term value",
    "connect.item1": "News",
    "connect.item2": "Professional resources",
    "connect.item3": "Training stories",
    "connect.item4": "AI applications",
    "connect.item5": "Careers",
    "connect.item6": "Project discussion",
    "connect.item7": "Local data",
    "connect.item8": "Kim Hoang 2026",
    "intro.kicker": "A foundation for modern management",
    "intro.headline": "Clear data leads to faster decisions, stronger records and more transparent management.",
    "intro.signal1.title": "Accurate cadastral work",
    "intro.signal1.text": "Current status, boundaries, maps and records are standardized into a trusted data source.",
    "intro.signal2.title": "Operational-ready data",
    "intro.signal2.text": "Databases are structured for lookup, updates, reporting and future expansion.",
    "intro.signal3.title": "Forestry tied to place",
    "intro.signal3.text": "Consulting and implementation are based on baseline data, legal context and the reality of each area.",
    "internship.kicker": "Internships & early talent",
    "internship.headline": "A place to see real work before choosing a long-term direction.",
    "internship.text": "Kim Hoang suits students who want to understand land management, surveying, mapping and data through operating projects, not only job descriptions on paper.",
    "internship.primary": "Apply for internship",
    "internship.secondary": "View real projects",
    "internship.card1.title": "Learn from real records, maps and data.",
    "internship.card1.text": "Students can see how field data becomes records, systems and handover workflows.",
    "internship.card2.title": "Get exposed to AI, OCR and automation.",
    "internship.card2.text": "Technology is tied to concrete work: document recognition, data checking and reducing repeated tasks.",
    "internship.card3.title": "Move from observation to clear pieces of work.",
    "internship.card3.text": "A practical path for newcomers: understand context, choose a direction, send information and discuss directly.",
    "cap.kicker": "Delivery capabilities",
    "cap.headline": "From field survey to data systems, every layer of information has a purpose.",
    "cap.row1.kicker": "Surveying & measurement",
    "cap.row1.title": "Measure the real conditions, standardize the right records.",
    "cap.row1.text": "Kim Hoang turns field data into maps, records and structured handover documents, making management more transparent.",
    "cap.row2.kicker": "Land digital transformation",
    "cap.row2.title": "A database that can be searched, managed and expanded.",
    "cap.row2.text": "Data is collected, reviewed, standardized and organized as a system for long-term operation, not just a single dossier.",
    "cap.row3.kicker": "Forestry & local development",
    "cap.row3.title": "Consulting connected to conditions, legality and development goals.",
    "cap.row3.text": "Forestry projects are approached through baseline data, legal records and local needs to create feasible plans.",
    "story.meter": "Kim Hoang Journey",
    "story.stage1.label": "Raising team standards",
    "story.stage1.title": "New knowledge becomes process, not just a campaign.",
    "story.stage1.text": "Kim Hoang updates technology, trains people and brings data thinking into each implementation step for more stable project quality.",
    "story.stage1.point1": "Internal training aligned with project needs",
    "story.stage1.point2": "Technology that reduces repeated work",
    "story.stage1.point3": "Quality control before handover",
    "story.stage2.label": "Operational data",
    "story.stage2.title": "From maps and records to databases, everything must match and be easy to retrieve.",
    "story.stage2.text": "Data is reviewed, standardized and structured into a platform for long-term management, not just one acceptance milestone.",
    "story.stage2.point1": "Standardized information layers and attributes",
    "story.stage2.point2": "Optimized for lookup, updates and reporting",
    "story.stage2.point3": "Clear structure and clear responsibility",
    "story.stage3.label": "Key projects",
    "story.stage3.title": "When many parties coordinate, data must speak one language.",
    "story.stage3.text": "For infrastructure and local management projects, data organization determines the speed of coordination, review and issue handling.",
    "story.stage3.point1": "Project information arranged by context",
    "story.stage3.point2": "Clear delivery roles at each stage",
    "story.stage3.point3": "Handover results that are easy to verify",
    "story.stage4.label": "15 years of growth",
    "story.stage4.title": "Longstanding experience, a fresher service style and a more trusted presence.",
    "story.stage4.text": "Kim Hoang keeps the reliability built over many years while refreshing its communication so clients can feel its capabilities faster.",
    "story.stage4.point1": "Short, clear and focused messaging",
    "story.stage4.point2": "Real imagery with credibility first",
    "story.stage4.point3": "Smooth experience on desktop and mobile",
    "projects.kicker": "Featured projects",
    "projects.headline": "Real images, real context and delivery capability told like a short film.",
    "projects.text": "Each project is placed in a large frame so viewers can immediately sense scale, role and outcomes.",
    "projects.item1.kicker": "Infrastructure project",
    "projects.item1.title": "Data for large-scale linear infrastructure.",
    "projects.item1.text": "Route information, current conditions and related records are organized so coordination, review and handover become clearer.",
    "projects.item2.kicker": "Digital transformation",
    "projects.item2.title": "Bringing cadastral work into an operational data structure.",
    "projects.item2.text": "Data is standardized by information layers, attributes and verification workflows for long-term management.",
    "projects.item3.kicker": "15 years of growth",
    "projects.item3.title": "A trusted foundation built through experience and delivery discipline.",
    "projects.item3.text": "Kim Hoang refreshes its presence while keeping its core values: certainty, dedication and responsibility for delivered data.",
    "partners.kicker": "Partners",
    "partners.headline": "Relationships that make Kim Hoang's delivery capability clearer.",
    "partners.text": "From professional training and transport infrastructure to energy, partners act as concise evidence of experience across different ecosystems.",
    "partners.item1": "Training & expertise",
    "partners.item2": "Transport infrastructure",
    "partners.item3": "Energy & linear works",
    "careers.kicker": "Careers",
    "careers.headline": "A dedicated space for candidates who want to work with real data.",
    "careers.text": "The careers page gives applicants a quick view of Kim Hoang, the work environment and the essential information needed for the team to follow up.",
    "careers.action": "Open careers page",
    "insights.kicker": "News, projects & resources",
    "insights.headline": "Stories that help readers understand how Kim Hoang works.",
    "insights.text": "News, projects and professional resources sit in one reading space: clear in context, easy to choose and calm enough to keep exploring.",
    "insights.item1.title": "Process for building a land database",
    "insights.item1.text": "From records and maps to structured operational data.",
    "insights.item2.title": "Land Law 2024",
    "insights.item2.text": "The legal foundation for projects to move in the right direction.",
    "insights.item3.title": "IT applications in cadastral work",
    "insights.item3.text": "Standardizing operations, shortening lookup time and reducing data risk.",
    "contact.kicker": "Contact",
    "contact.headline": "Start a clearer data project.",
    "contact.text": "Kim Hoang is ready to discuss surveying, land databases, forestry and local management challenges.<br />1537 Hoang Hoa Tham Street, Da Mai Ward, Bac Ninh Province<br />0240.352.0375 | support@kimhoang.vn",
    "contact.action": "Send inquiry",
    "footer.credit": "Experience designed and developed by Kim Nhat Hoang · 2026",
    "footer.back": "Back to top"
  },
  zh: {
    "meta.title": "Kim Hoang | 土地与林业数据",
    "meta.description": "Kim Hoang 的现代企业介绍，聚焦测绘、土地数据系统与林业咨询。",
    "premiere.kicker": "土地数据。地图。林业。",
    "premiere.headline": "以更清晰的方式理解地方管理。",
    "premiere.loading": "正在准备图像 {percent}%",
    "premiere.ready": "已就绪",
    "premiere.optimized": "正在打开优化体验",
    "premiere.skip": "进入网站",
    "nav.label": "主导航",
    "nav.capabilities": "能力",
    "nav.story": "历程",
    "nav.projects": "项目",
    "nav.partners": "合作伙伴",
    "nav.careers": "招聘",
    "nav.insights": "文章",
    "nav.contact": "联系",
    "hero.kicker": "测绘。数据。林业。",
    "hero.headline": "把土地数据转化为更清晰的管理基础。",
    "hero.lede": "Kim Hoang 与机构、地方政府和企业合作，开展地籍测绘、土地数据库建设与林业咨询，以精准、系统且可验证的方法推进项目。",
    "hero.primary": "查看历程",
    "hero.secondary": "启动项目",
    "hero.stat": "年持续建设地方数据",
    "overview.item1.title": "15+ 年地方数据经验",
    "overview.item1.text": "覆盖土地档案、地图与管理数据的实施经验。",
    "overview.item2.title": "测绘、地图与数据库",
    "overview.item2.text": "从现场工作到运行系统，每一层信息都有明确目的。",
    "overview.item3.title": "AI、OCR 与自动化",
    "overview.item3.text": "技术用于数据检查、文档识别，并减少重复操作。",
    "overview.item4.title": "面向学生实习的平台",
    "overview.item4.text": "看见真实项目，选择适合方向，并快速提交信息。",
    "overview.item4.action": "申请实习",
    "ticker.overview.1": "15+ 年地方数据经验",
    "ticker.overview.2": "测绘、地图与数据库",
    "ticker.overview.3": "AI、OCR 与自动化",
    "ticker.overview.4": "面向学生实习的平台",
    "ticker.intro.1": "现状清晰",
    "ticker.intro.2": "边界清晰",
    "ticker.intro.3": "档案清晰",
    "ticker.intro.4": "运营数据清晰",
    "ticker.internship.1": "从真实项目开始实习",
    "ticker.internship.2": "真实档案、地图与数据",
    "ticker.internship.3": "接触 AI 工作流",
    "ticker.internship.4": "快速提交实习信息",
    "ticker.capabilities.1": "调查与测量",
    "ticker.capabilities.2": "地籍档案标准化",
    "ticker.capabilities.3": "土地数据库",
    "ticker.capabilities.4": "结合地方场景的林业",
    "ticker.story.1": "提升团队标准",
    "ticker.story.2": "面向长期运营的数据",
    "ticker.story.3": "重点项目",
    "ticker.story.4": "15 年发展",
    "ticker.projects.1": "真实图像，真实背景",
    "ticker.projects.2": "大型线路工程",
    "ticker.projects.3": "易于核查的数据",
    "ticker.projects.4": "清晰的交付责任",
    "ticker.partners.1": "培训与专业能力",
    "ticker.partners.2": "交通基础设施",
    "ticker.partners.3": "能源与线路工程",
    "ticker.partners.4": "更广的实施生态",
    "ticker.careers.1": "实习生与新人",
    "ticker.careers.2": "真实项目环境",
    "ticker.careers.3": "AI、OCR 与自动化",
    "ticker.careers.4": "快速提交申请",
    "ticker.insights.1": "技术与培训新闻",
    "ticker.insights.2": "背景清晰的项目",
    "ticker.insights.3": "易读的专业资料",
    "ticker.insights.4": "页面内平滑切换文章",
    "marquee.item1": "15+ 年地方数据经验",
    "marquee.item2": "地籍测绘",
    "marquee.item3": "土地数据库",
    "marquee.item4": "结合地方场景的林业",
    "marquee.item5": "大型基础设施项目",
    "marquee.item6": "AI、OCR 与自动化",
    "marquee.item7": "档案清晰，数据可靠",
    "marquee.item8": "与机构和地方政府同行",
    "process.item1": "接收背景",
    "process.item2": "现场调查",
    "process.item3": "地图测绘",
    "process.item4": "档案标准化",
    "process.item5": "属性核查",
    "process.item6": "数据建设",
    "process.item7": "便于查询的交付",
    "process.item8": "按管理需求更新",
    "proof.item1": "真实图像",
    "proof.item2": "真实场景",
    "proof.item3": "线路工程",
    "proof.item4": "数据图层",
    "proof.item5": "地籍档案",
    "proof.item6": "实施角色",
    "proof.item7": "验收清晰",
    "proof.item8": "长期使用价值",
    "connect.item1": "新闻",
    "connect.item2": "专业资料",
    "connect.item3": "培训故事",
    "connect.item4": "AI 应用",
    "connect.item5": "招聘",
    "connect.item6": "项目交流",
    "connect.item7": "地方数据",
    "connect.item8": "Kim Hoang 2026",
    "intro.kicker": "现代管理的基础",
    "intro.headline": "清晰的数据带来更快的决策、更可靠的档案和更透明的管理。",
    "intro.signal1.title": "精准地籍",
    "intro.signal1.text": "现状、边界、地图和档案被标准化为可信的数据来源。",
    "intro.signal2.title": "可运营的数据",
    "intro.signal2.text": "数据库被组织用于查询、更新、报告，并能随着管理需求扩展。",
    "intro.signal3.title": "立足地方的林业",
    "intro.signal3.text": "咨询与实施基于基础数据、法律背景以及各区域的实际特点。",
    "internship.kicker": "实习与新人成长",
    "internship.headline": "在选择长期方向之前，先看见真实工作。",
    "internship.text": "Kim Hoang 适合希望通过正在运行的项目理解土地管理、测绘、地图和数据的学生，而不只是阅读岗位描述。",
    "internship.primary": "申请实习",
    "internship.secondary": "查看真实项目",
    "internship.card1.title": "从真实档案、地图和数据中学习。",
    "internship.card1.text": "学生可以看到外业数据如何进入档案、系统和交付流程。",
    "internship.card2.title": "接触 AI、OCR 与自动化。",
    "internship.card2.text": "技术被放入具体业务：文档识别、数据检查和减少重复操作。",
    "internship.card3.title": "从观察逐步参与清晰的工作环节。",
    "internship.card3.text": "适合新人的路径：理解背景、选择方向、提交信息并直接交流。",
    "cap.kicker": "实施能力",
    "cap.headline": "从现场调查到数据系统，每一层信息都有明确目的。",
    "cap.row1.kicker": "调查与测量",
    "cap.row1.title": "准确测量现状，规范形成档案。",
    "cap.row1.text": "Kim Hoang 将外业数据转化为地图、档案和结构化交付资料，让管理过程更透明。",
    "cap.row2.kicker": "土地数字化转型",
    "cap.row2.title": "可查询、可管理、可扩展的数据库。",
    "cap.row2.text": "数据经过采集、复核、标准化和系统化组织，服务长期运营，而不是停留在单份档案。",
    "cap.row3.kicker": "林业与地方发展",
    "cap.row3.title": "结合现状、法律与发展目标的咨询。",
    "cap.row3.text": "林业项目从基础数据、法律档案和地方实际需求出发，形成可执行方案。",
    "story.meter": "Kim Hoang 历程",
    "story.stage1.label": "提升团队标准",
    "story.stage1.title": "新知识进入流程，而不是停留在口号。",
    "story.stage1.text": "Kim Hoang 更新技术、培训人才，并将数据思维融入每个实施步骤，使项目质量更加稳定。",
    "story.stage1.point1": "根据项目需求开展内部培训",
    "story.stage1.point2": "用技术减少重复操作",
    "story.stage1.point3": "交付前进行质量控制",
    "story.stage2.label": "运营数据",
    "story.stage2.title": "从地图、档案到数据库，一切都要匹配且易于检索。",
    "story.stage2.text": "数据经过复核、标准化并组织成可服务长期管理的平台，而不只是一次验收资料。",
    "story.stage2.point1": "标准化信息图层与属性",
    "story.stage2.point2": "优化查询、更新与报告",
    "story.stage2.point3": "结构清晰，责任清晰",
    "story.stage3.label": "重点项目",
    "story.stage3.title": "多方协同中，数据必须使用同一种语言。",
    "story.stage3.text": "在基础设施和地方管理项目中，数据组织方式决定协同、复核和问题处理的速度。",
    "story.stage3.point1": "按场景组织项目信息",
    "story.stage3.point2": "每个阶段的实施角色清晰",
    "story.stage3.point3": "交付结果便于核查与对照",
    "story.stage4.label": "15 年发展",
    "story.stage4.title": "多年经验、更新的服务方式和更可信的形象。",
    "story.stage4.text": "Kim Hoang 保留多年积累的稳健，同时更新沟通方式，让客户更快感知能力。",
    "story.stage4.point1": "简短、清晰、有重点的信息",
    "story.stage4.point2": "真实图像，优先体现可信度",
    "story.stage4.point3": "桌面与移动端都保持流畅体验",
    "projects.kicker": "代表项目",
    "projects.headline": "真实图像、真实场景，以短片方式呈现实施能力。",
    "projects.text": "每个项目都放在大画幅中，让观众立即感受到规模、角色和成果。",
    "projects.item1.kicker": "基础设施项目",
    "projects.item1.title": "服务大型线路工程的数据。",
    "projects.item1.text": "组织线路信息、现状和相关档案，使协同、复核和交付更加清晰。",
    "projects.item2.kicker": "数字化转型",
    "projects.item2.title": "把地籍业务放入可运营的数据结构。",
    "projects.item2.text": "数据按信息图层、属性和检查流程标准化，服务长期管理。",
    "projects.item3.kicker": "15 年发展",
    "projects.item3.title": "以经验和实施纪律构建可信基础。",
    "projects.item3.text": "Kim Hoang 更新呈现方式，同时保留核心价值：稳健、尽责，并对交付数据负责。",
    "partners.kicker": "合作伙伴",
    "partners.headline": "合作关系进一步说明 Kim Hoang 的实施能力。",
    "partners.text": "从专业培训、交通基础设施到能源，合作伙伴是跨领域经验的简洁证明。",
    "partners.item1": "培训与专业能力",
    "partners.item2": "交通基础设施",
    "partners.item3": "能源与线路工程",
    "careers.kicker": "招聘",
    "careers.headline": "为希望参与真实数据工作的候选人设置独立空间。",
    "careers.text": "招聘页面让候选人快速了解 Kim Hoang、工作环境，并提交必要信息，便于团队后续联系。",
    "careers.action": "进入招聘页面",
    "insights.kicker": "新闻、项目与资料",
    "insights.headline": "通过这些故事，更清楚地理解 Kim Hoang 的工作方式。",
    "insights.text": "新闻、项目和专业资料被放在同一个阅读空间中：背景清晰、选择方便，也足够舒缓，让访客继续了解。",
    "insights.item1.title": "土地数据库建设流程",
    "insights.item1.text": "从档案、地图到结构化运营数据。",
    "insights.item2.title": "2024 年土地法",
    "insights.item2.text": "项目正确推进的法律基础。",
    "insights.item3.title": "信息技术在地籍工作中的应用",
    "insights.item3.text": "规范操作、缩短查询时间并降低数据偏差风险。",
    "contact.kicker": "联系",
    "contact.headline": "开启一个更清晰的数据项目。",
    "contact.text": "Kim Hoang 愿意就测绘、土地数据库、林业以及地方管理问题进行交流。<br />北宁省 Da Mai 坊 Hoang Hoa Tham 路 1537 号<br />0240.352.0375 | support@kimhoang.vn",
    "contact.action": "发送信息",
    "footer.credit": "体验设计与开发：Kim Nhat Hoang · 2026",
    "footer.back": "返回顶部"
  },
  es: {
    "meta.title": "Kim Hoang | Datos de tierra y silvicultura",
    "meta.description": "Perfil corporativo moderno de Kim Hoang, centrado en topografía, sistemas de datos de tierra y consultoría forestal.",
    "premiere.kicker": "Datos de tierra. Mapas. Silvicultura.",
    "premiere.headline": "Una forma más clara de entender la gestión local.",
    "premiere.loading": "Preparando imágenes {percent}%",
    "premiere.ready": "Listo",
    "premiere.optimized": "Abriendo experiencia optimizada",
    "premiere.skip": "Entrar",
    "nav.label": "Navegación principal",
    "nav.capabilities": "Capacidades",
    "nav.story": "Trayectoria",
    "nav.projects": "Proyectos",
    "nav.partners": "Socios",
    "nav.careers": "Empleo",
    "nav.insights": "Artículos",
    "nav.contact": "Contacto",
    "hero.kicker": "Topografía. Datos. Silvicultura.",
    "hero.headline": "Convertimos datos de tierra en una base de gestión más clara.",
    "hero.lede": "Kim Hoang acompaña a organismos, autoridades locales y empresas en topografía catastral, bases de datos de tierra y consultoría forestal, con un método preciso, sistemático y verificable.",
    "hero.primary": "Ver trayectoria",
    "hero.secondary": "Conectar proyecto",
    "hero.stat": "años trabajando con datos locales",
    "overview.item1.title": "15+ años de datos locales",
    "overview.item1.text": "Experiencia en expedientes de tierra, mapas y datos de gestión.",
    "overview.item2.title": "Topografía, mapas y bases de datos",
    "overview.item2.text": "Del trabajo de campo al sistema operativo, cada capa de información tiene un propósito.",
    "overview.item3.title": "IA, OCR y automatización",
    "overview.item3.text": "La tecnología ayuda a revisar datos, reconocer documentos y reducir tareas repetidas.",
    "overview.item4.title": "Espacio para estudiantes en prácticas",
    "overview.item4.text": "Ver proyectos reales, elegir una dirección adecuada y enviar la información rápidamente.",
    "overview.item4.action": "Solicitar prácticas",
    "ticker.overview.1": "15+ años de datos locales",
    "ticker.overview.2": "Topografía, mapas y bases de datos",
    "ticker.overview.3": "IA, OCR y automatización",
    "ticker.overview.4": "Espacio para estudiantes en prácticas",
    "ticker.intro.1": "Estado actual claro",
    "ticker.intro.2": "Límites claros",
    "ticker.intro.3": "Expedientes claros",
    "ticker.intro.4": "Datos operativos claros",
    "ticker.internship.1": "Prácticas desde proyectos reales",
    "ticker.internship.2": "Expedientes, mapas y datos reales",
    "ticker.internship.3": "Acceso a flujos de IA",
    "ticker.internship.4": "Envío rápido de solicitud",
    "ticker.capabilities.1": "Levantamiento y medición",
    "ticker.capabilities.2": "Expedientes catastrales normalizados",
    "ticker.capabilities.3": "Bases de datos de tierra",
    "ticker.capabilities.4": "Silvicultura vinculada al territorio",
    "ticker.story.1": "Elevar el estándar del equipo",
    "ticker.story.2": "Datos para operación a largo plazo",
    "ticker.story.3": "Proyectos clave",
    "ticker.story.4": "15 años de desarrollo",
    "ticker.projects.1": "Imágenes reales, contexto real",
    "ticker.projects.2": "Infraestructura lineal a gran escala",
    "ticker.projects.3": "Datos fáciles de verificar",
    "ticker.projects.4": "Responsabilidad clara de entrega",
    "ticker.partners.1": "Formación y experiencia",
    "ticker.partners.2": "Infraestructura de transporte",
    "ticker.partners.3": "Energía y proyectos lineales",
    "ticker.partners.4": "Un ecosistema de entrega más amplio",
    "ticker.careers.1": "Practicantes y talento joven",
    "ticker.careers.2": "Entorno de proyectos reales",
    "ticker.careers.3": "IA, OCR y automatización",
    "ticker.careers.4": "Solicitud rápida",
    "ticker.insights.1": "Noticias de tecnología y formación",
    "ticker.insights.2": "Proyectos con contexto claro",
    "ticker.insights.3": "Recursos profesionales legibles",
    "ticker.insights.4": "Selección fluida de artículos",
    "marquee.item1": "15+ años de datos locales",
    "marquee.item2": "Topografía catastral",
    "marquee.item3": "Bases de datos de tierra",
    "marquee.item4": "Silvicultura conectada al territorio",
    "marquee.item5": "Proyectos de infraestructura a gran escala",
    "marquee.item6": "IA, OCR y automatización",
    "marquee.item7": "Expedientes claros, datos sólidos",
    "marquee.item8": "Trabajo con organismos y autoridades locales",
    "process.item1": "Contexto inicial",
    "process.item2": "Estudio de campo",
    "process.item3": "Cartografía",
    "process.item4": "Expedientes normalizados",
    "process.item5": "Verificación de atributos",
    "process.item6": "Construcción de datos",
    "process.item7": "Entrega fácil de consultar",
    "process.item8": "Actualización según gestión",
    "proof.item1": "Imágenes reales",
    "proof.item2": "Contexto real",
    "proof.item3": "Obras lineales",
    "proof.item4": "Capas de datos",
    "proof.item5": "Expedientes catastrales",
    "proof.item6": "Roles de implementación",
    "proof.item7": "Aceptación clara",
    "proof.item8": "Valor de uso a largo plazo",
    "connect.item1": "Noticias",
    "connect.item2": "Recursos profesionales",
    "connect.item3": "Historias de formación",
    "connect.item4": "Aplicaciones de IA",
    "connect.item5": "Empleo",
    "connect.item6": "Conversar proyecto",
    "connect.item7": "Datos locales",
    "connect.item8": "Kim Hoang 2026",
    "intro.kicker": "Base para una gestión moderna",
    "intro.headline": "Datos claros generan decisiones más rápidas, expedientes más sólidos y una gestión más transparente.",
    "intro.signal1.title": "Catastro preciso",
    "intro.signal1.text": "El estado actual, los límites, los mapas y los expedientes se normalizan en una fuente de datos confiable.",
    "intro.signal2.title": "Datos listos para operar",
    "intro.signal2.text": "Las bases de datos se organizan para consulta, actualización, informes y ampliación futura.",
    "intro.signal3.title": "Silvicultura vinculada al territorio",
    "intro.signal3.text": "La consultoría y la implementación se basan en datos base, marco legal y realidad de cada zona.",
    "internship.kicker": "Prácticas y talento joven",
    "internship.headline": "Un lugar para ver trabajo real antes de elegir una dirección a largo plazo.",
    "internship.text": "Kim Hoang encaja con estudiantes que quieren entender gestión de tierra, topografía, mapas y datos desde proyectos en operación, no solo desde una descripción de puesto.",
    "internship.primary": "Solicitar prácticas",
    "internship.secondary": "Ver proyectos reales",
    "internship.card1.title": "Aprender desde expedientes, mapas y datos reales.",
    "internship.card1.text": "Los estudiantes ven cómo los datos de campo entran en expedientes, sistemas y procesos de entrega.",
    "internship.card2.title": "Acceso a IA, OCR y automatización.",
    "internship.card2.text": "La tecnología se aplica a trabajo concreto: reconocimiento documental, revisión de datos y reducción de tareas repetidas.",
    "internship.card3.title": "Pasar de observar a participar en tareas claras.",
    "internship.card3.text": "Un recorrido práctico para principiantes: entender contexto, elegir dirección, enviar información y conversar directamente.",
    "cap.kicker": "Capacidades de implementación",
    "cap.headline": "Desde el estudio de campo hasta el sistema de datos, cada capa de información tiene un propósito.",
    "cap.row1.kicker": "Levantamiento y medición",
    "cap.row1.title": "Medir correctamente el estado real y normalizar los expedientes.",
    "cap.row1.text": "Kim Hoang transforma datos de campo en mapas, expedientes y documentos de entrega estructurados para una gestión más transparente.",
    "cap.row2.kicker": "Transformación digital de la tierra",
    "cap.row2.title": "Una base de datos consultable, gestionable y ampliable.",
    "cap.row2.text": "Los datos se recopilan, revisan, normalizan y organizan como sistema para operación a largo plazo, no solo como un expediente aislado.",
    "cap.row3.kicker": "Silvicultura y gestión local",
    "cap.row3.title": "Consultoría conectada con estado actual, legalidad y objetivos de desarrollo.",
    "cap.row3.text": "Los proyectos forestales se abordan desde datos base, expedientes legales y necesidades locales para crear planes viables.",
    "story.meter": "Trayectoria de Kim Hoang",
    "story.stage1.label": "Elevar el estándar del equipo",
    "story.stage1.title": "El nuevo conocimiento entra en el proceso, no se queda en una campaña.",
    "story.stage1.text": "Kim Hoang actualiza tecnología, forma a su equipo e incorpora pensamiento de datos en cada paso para estabilizar la calidad del proyecto.",
    "story.stage1.point1": "Formación interna según necesidades del proyecto",
    "story.stage1.point2": "Tecnología para reducir tareas repetitivas",
    "story.stage1.point3": "Control de calidad antes de la entrega",
    "story.stage2.label": "Datos operativos",
    "story.stage2.title": "De mapas y expedientes a bases de datos: todo debe coincidir y ser fácil de consultar.",
    "story.stage2.text": "Los datos se revisan, normalizan y estructuran en una plataforma útil para gestión a largo plazo, no solo para una aceptación puntual.",
    "story.stage2.point1": "Capas de información y atributos normalizados",
    "story.stage2.point2": "Optimizado para consulta, actualización e informes",
    "story.stage2.point3": "Estructura clara y responsabilidades claras",
    "story.stage3.label": "Proyectos clave",
    "story.stage3.title": "Cuando muchas partes coordinan, los datos deben hablar un mismo idioma.",
    "story.stage3.text": "En proyectos de infraestructura y gestión local, la organización de datos define la velocidad de coordinación, revisión y resolución.",
    "story.stage3.point1": "Información del proyecto organizada por contexto",
    "story.stage3.point2": "Roles de implementación claros en cada etapa",
    "story.stage3.point3": "Resultados de entrega fáciles de verificar",
    "story.stage4.label": "15 años de desarrollo",
    "story.stage4.title": "Experiencia de años, una forma de servicio renovada y una presencia más confiable.",
    "story.stage4.text": "Kim Hoang conserva la solidez construida durante años y renueva su comunicación para que los clientes perciban su capacidad más rápido.",
    "story.stage4.point1": "Mensajes breves, claros y enfocados",
    "story.stage4.point2": "Imágenes reales, con credibilidad primero",
    "story.stage4.point3": "Experiencia fluida en escritorio y móvil",
    "projects.kicker": "Proyectos destacados",
    "projects.headline": "Imágenes reales, contexto real y capacidad de implementación narrada como un cortometraje.",
    "projects.text": "Cada proyecto se presenta en un marco amplio para que el visitante perciba de inmediato escala, rol y resultados.",
    "projects.item1.kicker": "Proyecto de infraestructura",
    "projects.item1.title": "Datos para obras lineales de gran escala.",
    "projects.item1.text": "La información de ruta, estado actual y expedientes relacionados se organiza para que la coordinación, revisión y entrega sean más claras.",
    "projects.item2.kicker": "Transformación digital",
    "projects.item2.title": "Llevar el trabajo catastral a una estructura de datos operativa.",
    "projects.item2.text": "Los datos se normalizan por capas, atributos y procesos de verificación para la gestión a largo plazo.",
    "projects.item3.kicker": "15 años de desarrollo",
    "projects.item3.title": "Una base confiable construida con experiencia y disciplina de ejecución.",
    "projects.item3.text": "Kim Hoang renueva su presencia sin perder sus valores centrales: certeza, dedicación y responsabilidad con los datos entregados.",
    "partners.kicker": "Socios",
    "partners.headline": "Relaciones que hacen más clara la capacidad de implementación de Kim Hoang.",
    "partners.text": "Desde formación profesional e infraestructura de transporte hasta energía, los socios son una prueba breve de experiencia en distintos ecosistemas.",
    "partners.item1": "Formación y experiencia",
    "partners.item2": "Infraestructura de transporte",
    "partners.item3": "Energía y obras lineales",
    "careers.kicker": "Empleo",
    "careers.headline": "Un espacio dedicado para quienes quieren trabajar con datos reales.",
    "careers.text": "La página de empleo presenta rápidamente a Kim Hoang, el entorno de trabajo y la información esencial para que el equipo pueda contactar al candidato.",
    "careers.action": "Abrir página de empleo",
    "insights.kicker": "Noticias, proyectos y recursos",
    "insights.headline": "Historias que ayudan a entender mejor cómo trabaja Kim Hoang.",
    "insights.text": "Noticias, proyectos y recursos profesionales conviven en un mismo espacio de lectura: con contexto claro, fácil elección y una navegación tranquila.",
    "insights.item1.title": "Proceso de construcción de una base de datos de tierra",
    "insights.item1.text": "De expedientes y mapas a datos operativos estructurados.",
    "insights.item2.title": "Ley de tierras 2024",
    "insights.item2.text": "La base legal para que los proyectos avancen correctamente.",
    "insights.item3.title": "Aplicación de TI en el trabajo catastral",
    "insights.item3.text": "Normalizar operaciones, acortar consultas y reducir riesgos de datos.",
    "contact.kicker": "Contacto",
    "contact.headline": "Inicie un proyecto de datos más claro.",
    "contact.text": "Kim Hoang está listo para conversar sobre topografía, bases de datos de tierra, silvicultura y desafíos de gestión local.<br />1537 calle Hoang Hoa Tham, barrio Da Mai, provincia de Bac Ninh<br />0240.352.0375 | support@kimhoang.vn",
    "contact.action": "Enviar información",
    "footer.credit": "Experiencia diseñada y desarrollada por Kim Nhat Hoang · 2026",
    "footer.back": "Volver arriba"
  }
};

const translationTargets = [
  [".premiere-copy span", "premiere.kicker"],
  [".premiere-copy strong", "premiere.headline"],
  [".premiere-skip", "premiere.skip"],
  [".main-nav a[href='#capabilities']", "nav.capabilities"],
  [".main-nav a[href='#story']", "nav.story"],
  [".main-nav a[href='#projects']", "nav.projects"],
  [".main-nav a[href='#partners']", "nav.partners"],
  [".main-nav a[href='./careers.html']", "nav.careers"],
  [".main-nav a[href='#insights']", "nav.insights"],
  [".main-nav a[href='#contact']", "nav.contact"],
  [".hero .eyebrow", "hero.kicker"],
  [".hero-content h1", "hero.headline"],
  [".hero-lede", "hero.lede"],
  [".hero-actions .primary-action", "hero.primary"],
  [".hero-actions .secondary-action", "hero.secondary"],
  [".hero-stat span", "hero.stat"],
  [".intro-copy .section-kicker", "intro.kicker"],
  [".intro-copy h2", "intro.headline"],
  [".signal-row:nth-child(1) h3", "intro.signal1.title"],
  [".signal-row:nth-child(1) p", "intro.signal1.text"],
  [".signal-row:nth-child(2) h3", "intro.signal2.title"],
  [".signal-row:nth-child(2) p", "intro.signal2.text"],
  [".signal-row:nth-child(3) h3", "intro.signal3.title"],
  [".signal-row:nth-child(3) p", "intro.signal3.text"],
  [".internship-copy .section-kicker", "internship.kicker"],
  [".internship-copy h2", "internship.headline"],
  [".internship-copy p", "internship.text"],
  [".internship-actions .primary-action", "internship.primary"],
  [".internship-actions .secondary-action", "internship.secondary"],
  [".internship-card:nth-child(1) h3", "internship.card1.title"],
  [".internship-card:nth-child(1) p", "internship.card1.text"],
  [".internship-card:nth-child(2) h3", "internship.card2.title"],
  [".internship-card:nth-child(2) p", "internship.card2.text"],
  [".internship-card:nth-child(3) h3", "internship.card3.title"],
  [".internship-card:nth-child(3) p", "internship.card3.text"],
  [".capabilities .section-kicker", "cap.kicker"],
  [".capabilities .section-heading h2", "cap.headline"],
  [".capability-row:nth-child(1) span", "cap.row1.kicker"],
  [".capability-row:nth-child(1) h3", "cap.row1.title"],
  [".capability-row:nth-child(1) p", "cap.row1.text"],
  [".capability-row:nth-child(2) span", "cap.row2.kicker"],
  [".capability-row:nth-child(2) h3", "cap.row2.title"],
  [".capability-row:nth-child(2) p", "cap.row2.text"],
  [".capability-row:nth-child(3) span", "cap.row3.kicker"],
  [".capability-row:nth-child(3) h3", "cap.row3.title"],
  [".capability-row:nth-child(3) p", "cap.row3.text"],
  [".story-meter span:first-child", "story.meter"],
  ["[data-stage='0'] .scene-label strong", "story.stage1.label"],
  ["[data-stage='0'] h2", "story.stage1.title"],
  ["[data-stage='0'] p", "story.stage1.text"],
  ["[data-stage='0'] .scene-points li:nth-child(1)", "story.stage1.point1"],
  ["[data-stage='0'] .scene-points li:nth-child(2)", "story.stage1.point2"],
  ["[data-stage='0'] .scene-points li:nth-child(3)", "story.stage1.point3"],
  ["[data-stage='1'] .scene-label strong", "story.stage2.label"],
  ["[data-stage='1'] h2", "story.stage2.title"],
  ["[data-stage='1'] p", "story.stage2.text"],
  ["[data-stage='1'] .scene-points li:nth-child(1)", "story.stage2.point1"],
  ["[data-stage='1'] .scene-points li:nth-child(2)", "story.stage2.point2"],
  ["[data-stage='1'] .scene-points li:nth-child(3)", "story.stage2.point3"],
  ["[data-stage='2'] .scene-label strong", "story.stage3.label"],
  ["[data-stage='2'] h2", "story.stage3.title"],
  ["[data-stage='2'] p", "story.stage3.text"],
  ["[data-stage='2'] .scene-points li:nth-child(1)", "story.stage3.point1"],
  ["[data-stage='2'] .scene-points li:nth-child(2)", "story.stage3.point2"],
  ["[data-stage='2'] .scene-points li:nth-child(3)", "story.stage3.point3"],
  ["[data-stage='3'] .scene-label strong", "story.stage4.label"],
  ["[data-stage='3'] h2", "story.stage4.title"],
  ["[data-stage='3'] p", "story.stage4.text"],
  ["[data-stage='3'] .scene-points li:nth-child(1)", "story.stage4.point1"],
  ["[data-stage='3'] .scene-points li:nth-child(2)", "story.stage4.point2"],
  ["[data-stage='3'] .scene-points li:nth-child(3)", "story.stage4.point3"],
  [".projects-intro .section-kicker", "projects.kicker"],
  [".projects-intro h2", "projects.headline"],
  [".projects-intro p", "projects.text"],
  [".project-feature:nth-child(1) .project-content span", "projects.item1.kicker"],
  [".project-feature:nth-child(1) .project-content h3", "projects.item1.title"],
  [".project-feature:nth-child(1) .project-content p", "projects.item1.text"],
  [".project-feature:nth-child(2) .project-content span", "projects.item2.kicker"],
  [".project-feature:nth-child(2) .project-content h3", "projects.item2.title"],
  [".project-feature:nth-child(2) .project-content p", "projects.item2.text"],
  [".project-feature:nth-child(3) .project-content span", "projects.item3.kicker"],
  [".project-feature:nth-child(3) .project-content h3", "projects.item3.title"],
  [".project-feature:nth-child(3) .project-content p", "projects.item3.text"],
  [".partners-copy .section-kicker", "partners.kicker"],
  [".partners-copy h2", "partners.headline"],
  [".partners-copy p", "partners.text"],
  [".partner-mark:nth-child(1) span", "partners.item1"],
  [".partner-mark:nth-child(2) span", "partners.item2"],
  [".partner-mark:nth-child(3) span", "partners.item3"],
  [".careers-entry-copy .section-kicker", "careers.kicker"],
  [".careers-entry-copy h2", "careers.headline"],
  [".careers-entry-copy p", "careers.text"],
  [".careers-entry .primary-action", "careers.action"],
  [".insights-heading .section-kicker", "insights.kicker"],
  [".insights-heading h2", "insights.headline"],
  [".insights-heading p", "insights.text"],
  [".insight-link:nth-child(1) strong", "insights.item1.title"],
  [".insight-link:nth-child(1) em", "insights.item1.text"],
  [".insight-link:nth-child(2) strong", "insights.item2.title"],
  [".insight-link:nth-child(2) em", "insights.item2.text"],
  [".insight-link:nth-child(3) strong", "insights.item3.title"],
  [".insight-link:nth-child(3) em", "insights.item3.text"],
  [".contact-copy .section-kicker", "contact.kicker"],
  [".contact-copy h2", "contact.headline"],
  [".contact-copy p", "contact.text", true],
  [".contact-band .primary-action", "contact.action"],
  [".site-footer p", "footer.credit"],
  [".site-footer > a", "footer.back"]
];

const readStoredLanguage = () => {
  try {
    return localStorage.getItem("kimhoang-language");
  } catch {
    return null;
  }
};

const writeStoredLanguage = (language) => {
  try {
    localStorage.setItem("kimhoang-language", language);
  } catch {
    // Local storage can be unavailable in some privacy modes.
  }
};

let currentLanguage = supportedLanguages.includes(readStoredLanguage() ?? "")
  ? readStoredLanguage()
  : "vi";

const translate = (key) => translations[currentLanguage]?.[key] ?? translations.vi[key] ?? key;

const applyLanguage = (language, shouldPersist = true) => {
  currentLanguage = supportedLanguages.includes(language) ? language : "vi";
  if (shouldPersist) {
    writeStoredLanguage(currentLanguage);
  }

  document.documentElement.lang = languageMeta[currentLanguage].htmlLang;
  document.title = translate("meta.title");
  metaDescription?.setAttribute("content", translate("meta.description"));
  document.querySelector(".main-nav")?.setAttribute("aria-label", translate("nav.label"));
  document.querySelector(".language-switcher")?.setAttribute("aria-label", currentLanguage === "vi" ? "Ngôn ngữ" : "Language");

  translationTargets.forEach(([selector, key, useHtml]) => {
    document.querySelectorAll(selector).forEach((element) => {
      if (useHtml) {
        element.innerHTML = translate(key);
        return;
      }

      element.textContent = translate(key);
    });
  });

  document.querySelectorAll("[data-i18n]").forEach((element) => {
    const key = element.dataset.i18n;
    if (key) {
      element.textContent = translate(key);
    }
  });

  storyScenes.forEach((scene, index) => {
    scene.dataset.title = translate(`story.stage${index + 1}.label`);
  });

  languageButtons.forEach((button) => {
    const isActive = button.dataset.lang === currentLanguage;
    button.classList.toggle("is-active", isActive);
    button.toggleAttribute("aria-current", isActive);
  });

  if (preloadStatus && !didUnlockPremiere) {
    preloadStatus.textContent = translate("premiere.loading").replace("{percent}", "0");
  }

  measureLayout();
  setProgress();
};

const measureLayout = () => {
  layoutMetrics.maxScroll = Math.max(document.documentElement.scrollHeight - window.innerHeight, 1);
  layoutMetrics.heroHeight = Math.max(hero?.offsetHeight ?? window.innerHeight, 1);
  layoutMetrics.storyTop = story?.offsetTop ?? 0;
  layoutMetrics.storyHeight = Math.max(story?.offsetHeight ?? 0, 1);
  layoutMetrics.nav = navTargets.map((item) => ({
    ...item,
    top: item.section.offsetTop,
    bottom: item.section.offsetTop + item.section.offsetHeight
  }));
  resizeStoryCanvas();
};

const resizeStoryCanvas = () => {
  if (!storyCanvas) return;

  const width = storyCanvas.clientWidth;
  const height = storyCanvas.clientHeight;
  const ratio = 1;
  const nextWidth = Math.max(1, Math.round(width * ratio));
  const nextHeight = Math.max(1, Math.round(height * ratio));

  if (nextWidth === lastCanvasWidth && nextHeight === lastCanvasHeight) return;

  storyCanvas.width = nextWidth;
  storyCanvas.height = nextHeight;
  lastCanvasWidth = nextWidth;
  lastCanvasHeight = nextHeight;
  lastStoryCanvasIndex = -1;

  if (storyCanvasContext) {
    storyCanvasContext.setTransform(ratio, 0, 0, ratio, 0, 0);
    renderStoryCanvas(storyIndex);
  }
};

const warmStageImages = () => {
  const storyImages = story?.querySelectorAll("img") ?? [];

  storyImages.forEach((image) => {
    image.loading = "eager";
    image.decoding = "async";
    image.fetchPriority = "high";
  });

  const decoded = Array.from(storyImages, (image) => {
    if (image.complete && image.naturalWidth > 0) return Promise.resolve();
    if (typeof image.decode === "function") {
      return image.decode().catch(() => undefined);
    }

    return new Promise((resolve) => {
      image.addEventListener("load", resolve, { once: true });
      image.addEventListener("error", resolve, { once: true });
    });
  });

  Promise.all(decoded).then(() => {
    story?.classList.add("is-stage-ready");
  });
};

const getStoryImageSources = () => Array.from(storyScenes, (scene) => {
  const image = scene.querySelector(".scene-image");
  return image?.currentSrc || image?.src || "";
}).filter(Boolean);

const decodeLayerImage = (image) => {
  const decode = () => {
    if (typeof image.decode === "function") {
      return image.decode().catch(() => undefined);
    }

    return Promise.resolve();
  };

  if (image.complete && image.naturalWidth > 0) {
    return decode();
  }

  return new Promise((resolve) => {
    image.addEventListener("load", resolve, { once: true });
    image.addEventListener("error", resolve, { once: true });
  }).then(decode);
};

const prepareStoryCompositor = () => {
  if (!storyCompositor || !storyScenes.length) return Promise.resolve(false);

  const sources = getStoryImageSources();
  if (!sources.length) return Promise.resolve(false);

  storyCompositor.replaceChildren();
  storyImageLayers.splice(0, storyImageLayers.length);
  storyCompositorReady = false;
  story?.classList.remove("is-compositor-ready");
  storyCompositor.style.setProperty("--story-frame-count", String(sources.length));
  storyCompositor.style.setProperty("--story-frame-index", String(storyIndex));
  storyCompositor.style.setProperty("--story-frame-width", `${100 / sources.length}%`);
  storyCompositor.style.setProperty("--story-strip-width", `${sources.length * 100}%`);
  storyCompositor.style.setProperty("--story-strip-x", `${storyIndex * (-100 / sources.length)}%`);

  const strip = document.createElement("div");
  strip.className = "story-strip";
  strip.setAttribute("aria-hidden", "true");

  const decoded = sources.map((source, index) => {
    const image = new Image();
    image.className = "story-frame";
    image.alt = "";
    image.decoding = "async";
    image.loading = "eager";
    image.fetchPriority = "high";
    image.dataset.storyLayer = String(index);
    image.src = source;

    if (index === storyIndex) {
      image.classList.add("is-active");
    }

    strip.appendChild(image);
    storyImageLayers.push(image);
    return decodeLayerImage(image);
  });

  storyCompositor.appendChild(strip);

  return Promise.all(decoded).then(() => {
    storyCompositorReady = storyImageLayers.length > 0;

    if (storyCompositorReady) {
      story?.classList.add("is-compositor-ready");
      renderStoryLayer(storyIndex);
      updateStoryScene(storyIndex);
    }

    return storyCompositorReady;
  });
};

const criticalImageSources = [
  "./assets/kimhoang-source/hero-banner.jpg",
  "./assets/kimhoang-source/powerline-main.jpg",
  "./assets/kimhoang-source/ai-banner.jpg",
  "./assets/kimhoang-source/database-flow.jpg",
  "./assets/kimhoang-source/ai-session-1.jpg",
  "./assets/kimhoang-source/digital-40.jpg",
  "./assets/kimhoang-source/powerline-route.jpg",
  "./assets/kimhoang-source/gallery-office-1.jpeg"
];

const collectPreloadSources = () => {
  const domSources = Array.from(document.images, (image) => image.currentSrc || image.src)
    .filter(Boolean);

  return Array.from(new Set([...criticalImageSources, ...domSources]));
};

const decodeImage = (source) => new Promise((resolve) => {
  const image = new Image();
  image.decoding = "async";
  image.loading = "eager";
  image.onload = () => {
    if (typeof image.decode === "function") {
      image.decode().then(resolve).catch(resolve);
      return;
    }

    resolve();
  };
  image.onerror = resolve;
  image.src = source;
});

const createDrawableImage = (source) => new Promise((resolve) => {
  const image = new Image();
  image.decoding = "async";
  image.onload = async () => {
    try {
      if (typeof createImageBitmap === "function") {
        const bitmap = await createImageBitmap(image);
        resolve(bitmap);
        return;
      }
    } catch {
      // Keep the original image as a safe canvas source.
    }

    resolve(image);
  };
  image.onerror = () => resolve(null);
  image.src = source;
});

const prepareStoryCanvasImages = () => {
  if (!storyCanvas || !storyScenes.length) return Promise.resolve();

  storyCanvasContext = storyCanvas.getContext("2d", {
    alpha: false,
    desynchronized: true
  });

  if (!storyCanvasContext) return Promise.resolve();
  storyCanvasContext.imageSmoothingEnabled = true;
  storyCanvasContext.imageSmoothingQuality = "medium";

  const sources = Array.from(storyScenes, (scene) => scene.querySelector(".scene-image")?.src)
    .filter(Boolean);

  return Promise.all(sources.map(createDrawableImage)).then((images) => {
    storyCanvasImages.splice(0, storyCanvasImages.length, ...images);
    storyCanvasReady = storyCanvasImages.some(Boolean);
    if (storyCanvasReady) {
      story?.classList.add("is-canvas-ready");
      resizeStoryCanvas();
      renderStoryCanvas(storyIndex);
    }
  });
};

const prepareCriticalAssets = () => {
  if (!premiere) return Promise.resolve();

  const startedAt = window.performance.now();
  const sources = collectPreloadSources();
  let loaded = 0;
  const total = sources.length;

  const updateStatus = () => {
    if (!preloadStatus) return;
    const percent = Math.round((loaded / total) * 100);
    preloadStatus.textContent = translate("premiere.loading").replace("{percent}", percent);
  };

  updateStatus();

  document.querySelectorAll("img").forEach((image) => {
    image.decoding = "async";
    image.loading = "eager";
  });

  const decoded = Promise.all(sources.map((source) => (
    decodeImage(source).then(() => {
      loaded += 1;
      updateStatus();
    })
  )));
  const storyVisualPrepared = prepareStoryCompositor().then((isReady) => (
    isReady ? undefined : prepareStoryCanvasImages()
  ));

  const minimumPremiere = new Promise((resolve) => window.setTimeout(resolve, 850));
  const maximumWait = new Promise((resolve) => window.setTimeout(resolve, 3200));

  return Promise.race([
    Promise.all([decoded, storyVisualPrepared, minimumPremiere]),
    maximumWait
  ]).then(() => {
    if (preloadStatus) {
      const elapsed = window.performance.now() - startedAt;
      preloadStatus.textContent = elapsed > 3000 ? translate("premiere.optimized") : translate("premiere.ready");
    }
  });
};

const revealVisibleItems = () => {
  reveals.forEach((item) => {
    const box = item.getBoundingClientRect();
    const isVisible = box.top < window.innerHeight * 0.92 && box.bottom > window.innerHeight * 0.08;

    if (isVisible) {
      item.classList.add("is-visible");
    }
  });
};

const preloadArticleImages = () => {
  articleCards.forEach((card) => {
    const src = card.dataset.image;
    if (!src || articleImageCache.has(src)) return;

    const image = new Image();
    image.decoding = "async";
    image.src = src;
    articleImageCache.set(src, image);
    image.decode?.().catch(() => {});
  });
};

const applyArticleImage = (image, card) => {
  if (!image || !card) return;

  if (card.dataset.image) {
    image.src = card.dataset.image;
  }
  image.style.objectPosition = card.dataset.position ?? "center center";
};

const updateArticleReader = (card) => {
  if (!articleReader || !card) return;

  const image = articleReader.querySelector("[data-article-image]");
  const category = articleReader.querySelector("[data-article-category]");
  const date = articleReader.querySelector("[data-article-date]");
  const read = articleReader.querySelector("[data-article-read]");
  const title = articleReader.querySelector("[data-article-title]");
  const summary = articleReader.querySelector("[data-article-summary]");
  const points = articleReader.querySelector("[data-article-points]");
  const pointItems = (card.dataset.points ?? "").split("|").filter(Boolean);
  activeArticleCard = card;

  articleCards.forEach((item) => {
    const isActive = item === card;
    item.classList.toggle("is-active", isActive);
    if (isActive) {
      item.setAttribute("aria-current", "true");
    } else {
      item.removeAttribute("aria-current");
    }
  });

  articleReader.classList.add("is-switching");

  window.setTimeout(() => {
    applyArticleImage(image, card);

    if (category) category.textContent = card.dataset.category ?? "";
    if (date) date.textContent = card.dataset.date ?? "";
    if (read) read.textContent = card.dataset.read ?? "";
    if (title) title.textContent = card.dataset.title ?? "";
    if (summary) summary.textContent = card.dataset.summary ?? "";

    if (points) {
      points.replaceChildren(...pointItems.map((text) => {
        const item = document.createElement("li");
        item.textContent = text;
        return item;
      }));
    }

    window.requestAnimationFrame(() => {
      articleReader.classList.remove("is-switching");
    });
  }, 180);
};

const fillArticleModal = (card) => {
  if (!articleModal || !card) return;

  const image = articleModal.querySelector("[data-modal-image]");
  const category = articleModal.querySelector("[data-modal-category]");
  const date = articleModal.querySelector("[data-modal-date]");
  const read = articleModal.querySelector("[data-modal-read]");
  const title = articleModal.querySelector("[data-modal-title]");
  const summary = articleModal.querySelector("[data-modal-summary]");
  const content = articleModal.querySelector("[data-modal-content]");
  const paragraphs = (card.dataset.content ?? card.dataset.summary ?? "")
    .split("|")
    .filter(Boolean);

  applyArticleImage(image, card);
  if (category) category.textContent = card.dataset.category ?? "";
  if (date) date.textContent = card.dataset.date ?? "";
  if (read) read.textContent = card.dataset.read ?? "";
  if (title) title.textContent = card.dataset.title ?? "";
  if (summary) summary.textContent = card.dataset.summary ?? "";

  if (content) {
    content.replaceChildren(...paragraphs.map((text) => {
      const paragraph = document.createElement("p");
      paragraph.textContent = text;
      return paragraph;
    }));
  }
};

const openArticleModal = () => {
  if (!articleModal || !activeArticleCard) return;

  fillArticleModal(activeArticleCard);
  articleModal.setAttribute("aria-hidden", "false");
  document.body.classList.add("article-modal-open");
};

const closeArticleModal = () => {
  if (!articleModal) return;

  articleModal.setAttribute("aria-hidden", "true");
  document.body.classList.remove("article-modal-open");
};

const setProgress = () => {
  const progress = clamp01(window.scrollY / layoutMetrics.maxScroll);
  meter.style.transform = `scaleX(${progress})`;
  header.classList.toggle("is-solid", window.scrollY > 40);
  updateHeroMotion();
  const isStoryActive = updateStoryMotion();
  if (!isStoryActive) {
    updateCinematicItems();
  }
  updateActiveNav();
};

const hidePremiere = () => {
  if (didUnlockPremiere) return;
  didUnlockPremiere = true;
  premiere?.classList.add("is-hidden");
};

const skipPremiere = () => {
  premiere?.classList.add("is-skipped");
  hidePremiere();
};

const updateActiveNav = () => {
  if (!layoutMetrics.nav.length) return;

  const readY = window.scrollY + window.innerHeight * 0.38;
  let activeItem = null;

  layoutMetrics.nav.forEach((item) => {
    if (item.top <= readY && item.bottom > readY) {
      activeItem = item;
    }
  });

  if (!activeItem) {
    layoutMetrics.nav.forEach((item) => {
      if (item.top <= readY) {
        activeItem = item;
      }
    });
  }

  if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 4) {
    activeItem = layoutMetrics.nav[layoutMetrics.nav.length - 1];
  }

  layoutMetrics.nav.forEach((item) => {
    const isActive = item === activeItem;
    item.link.classList.toggle("is-active", isActive);
    item.link.toggleAttribute("aria-current", isActive);
  });
};

const updateHeroMotion = () => {
  if (!hero) return;

  const progress = clamp01(window.scrollY / layoutMetrics.heroHeight);
  hero.style.setProperty("--hero-drift", progress.toFixed(4));
  hero.style.setProperty("--hero-reel-x", `${(progress * -72).toFixed(2)}px`);
  hero.style.setProperty("--hero-reel-y", `${(progress * 38).toFixed(2)}px`);
  hero.style.setProperty("--hero-reel-rotate", `${(progress * -4).toFixed(3)}deg`);
};

const getMaxStoryIndex = () => Math.max(storyScenes.length - 1, 0);

const getStoryDistance = () => Math.max(layoutMetrics.storyHeight - window.innerHeight, 1);

const getStoryProgressFromScroll = () => {
  const raw = (window.scrollY - layoutMetrics.storyTop) / getStoryDistance();
  return clamp01(raw);
};

const getStoryProgressForIndex = (index) => {
  const maxIndex = Math.max(getMaxStoryIndex(), 1);
  return clamp01(index / maxIndex);
};

const getStoryScrollProgressForIndex = (index) => {
  const span = Math.max(getMaxStoryIndex() + storyExitHoldSteps, 1);
  return clamp01(index / span);
};

const getStoryIndexFromProgress = (progress) => {
  if (!storyScenes.length) return 0;

  const span = Math.max(getMaxStoryIndex() + storyExitHoldSteps, 1);
  return Math.min(getMaxStoryIndex(), Math.max(0, Math.round(clamp01(progress) * span)));
};

const isStoryOnScreen = () => {
  if (!story) return false;

  const storyStart = layoutMetrics.storyTop;
  const storyEnd = storyStart + layoutMetrics.storyHeight;
  return window.scrollY + window.innerHeight > storyStart && window.scrollY < storyEnd;
};

const isStoryGestureZone = () => {
  if (!story || !storyScenes.length || !isStoryOnScreen()) return false;

  const start = layoutMetrics.storyTop;
  const end = start + getStoryDistance();
  return window.scrollY >= start - 8 && window.scrollY <= end + 8;
};

const canStepStory = (direction) => {
  const maxIndex = getMaxStoryIndex();
  return !(direction < 0 && storyIndex <= 0) && !(direction > 0 && storyIndex >= maxIndex);
};

const resetStoryExitHold = () => {
  storyExitHoldDelta = 0;
  storyExitHoldReleased = false;
  storyExitHoldUntil = 0;
};

const armStoryExitHold = () => {
  storyExitHoldDelta = 0;
  storyExitHoldReleased = false;
  storyExitHoldUntil = window.performance.now() + storyTransitionDuration + storyExitHoldDuration;
};

const shouldHoldStoryExit = (direction) => (
  direction > 0
  && storyIndex >= getMaxStoryIndex()
  && isStoryGestureZone()
);

const consumeStoryExitHold = (amount) => {
  if (storyExitHoldReleased) return false;

  const now = window.performance.now();
  if (now < storyExitHoldUntil || storyTransitioning || now < storyScrollLockUntil) {
    return true;
  }

  storyExitHoldDelta += Math.abs(amount);
  if (storyExitHoldDelta >= storyExitHoldThreshold) {
    storyExitHoldReleased = true;
    storyExitHoldDelta = 0;
  }

  return true;
};

const scrollToStoryIndex = (index) => {
  if (!story) return;

  const progress = getStoryScrollProgressForIndex(index);
  const target = layoutMetrics.storyTop + getStoryDistance() * progress;
  const root = document.documentElement;
  const previousScrollBehavior = root.style.scrollBehavior;

  root.style.scrollBehavior = "auto";
  window.scrollTo(0, Math.round(target));
  window.requestAnimationFrame(() => {
    root.style.scrollBehavior = previousScrollBehavior;
  });
};

const drawCoverImage = (source, alpha, shiftX, shiftY, scale, clip) => {
  if (!storyCanvasContext || !source || alpha <= 0) return;

  const ratio = 1;
  const canvasWidth = storyCanvas.width / ratio;
  const canvasHeight = storyCanvas.height / ratio;
  const sourceWidth = source.width || source.naturalWidth || canvasWidth;
  const sourceHeight = source.height || source.naturalHeight || canvasHeight;
  const cover = Math.max(canvasWidth / sourceWidth, canvasHeight / sourceHeight) * scale;
  const drawWidth = sourceWidth * cover;
  const drawHeight = sourceHeight * cover;
  const drawX = (canvasWidth - drawWidth) / 2 + shiftX;
  const drawY = (canvasHeight - drawHeight) / 2 + shiftY;

  if (clip) {
    storyCanvasContext.save();
    storyCanvasContext.beginPath();
    storyCanvasContext.rect(clip.x, 0, clip.width, canvasHeight);
    storyCanvasContext.clip();
  }

  storyCanvasContext.globalAlpha = alpha;
  storyCanvasContext.drawImage(source, drawX, drawY, drawWidth, drawHeight);

  if (clip) {
    storyCanvasContext.restore();
  }
};

const paintStoryCanvasBase = () => {
  const ratio = 1;
  const canvasWidth = storyCanvas.width / ratio;
  const canvasHeight = storyCanvas.height / ratio;

  storyCanvasContext.setTransform(ratio, 0, 0, ratio, 0, 0);
  storyCanvasContext.globalAlpha = 1;
  storyCanvasContext.fillStyle = "#050607";
  storyCanvasContext.fillRect(0, 0, canvasWidth, canvasHeight);
};

const renderStoryCanvas = (index) => {
  if (!storyCanvasReady || !storyCanvasContext || !storyCanvasImages.length) return;

  const activeIndex = Math.min(storyCanvasImages.length - 1, Math.max(0, index));

  if (activeIndex === lastStoryCanvasIndex && !storyTransitioning) return;
  window.cancelAnimationFrame(storyTransitionFrame);
  storyTransitionFrame = 0;
  storyTransitioning = false;
  story?.classList.remove("is-transitioning");
  lastStoryCanvasIndex = activeIndex;

  storyCanvasContext.save();
  paintStoryCanvasBase();
  drawCoverImage(storyCanvasImages[activeIndex], 1, 0, 0, 1.048);
  storyCanvasContext.restore();
  storyCanvasContext.globalAlpha = 1;
};

const drawStorySweep = (edgeX, direction, opacity) => {
  if (!storyCanvasContext || opacity <= 0) return;

  const ratio = 1;
  const canvasWidth = storyCanvas.width / ratio;
  const canvasHeight = storyCanvas.height / ratio;
  const edgeWidth = Math.min(150, canvasWidth * 0.12);
  const x = Math.max(-edgeWidth, Math.min(canvasWidth, edgeX - edgeWidth / 2));
  const gradient = storyCanvasContext.createLinearGradient(x, 0, x + edgeWidth, 0);

  if (direction > 0) {
    gradient.addColorStop(0, "rgba(255, 255, 255, 0)");
    gradient.addColorStop(0.48, `rgba(244, 208, 138, ${0.38 * opacity})`);
    gradient.addColorStop(1, "rgba(255, 255, 255, 0)");
  } else {
    gradient.addColorStop(0, "rgba(255, 255, 255, 0)");
    gradient.addColorStop(0.52, `rgba(73, 199, 154, ${0.32 * opacity})`);
    gradient.addColorStop(1, "rgba(255, 255, 255, 0)");
  }

  storyCanvasContext.save();
  storyCanvasContext.globalAlpha = 1;
  storyCanvasContext.fillStyle = gradient;
  storyCanvasContext.fillRect(x, 0, edgeWidth, canvasHeight);
  storyCanvasContext.fillStyle = `rgba(255, 255, 255, ${0.14 * opacity})`;
  storyCanvasContext.fillRect(Math.max(0, Math.min(canvasWidth, edgeX)), 0, 1, canvasHeight);
  storyCanvasContext.restore();
};

const transitionStoryCanvas = (fromIndex, toIndex) => {
  if (!storyCanvasReady || !storyCanvasContext || !storyCanvasImages.length || fromIndex === toIndex) {
    renderStoryCanvas(toIndex);
    return;
  }

  const maxCanvasIndex = storyCanvasImages.length - 1;
  const from = Math.min(maxCanvasIndex, Math.max(0, fromIndex));
  const to = Math.min(maxCanvasIndex, Math.max(0, toIndex));
  const direction = to > from ? 1 : -1;
  const startedAt = window.performance.now();

  window.cancelAnimationFrame(storyTransitionFrame);
  storyTransitioning = true;
  story?.classList.add("is-transitioning");
  story?.style.setProperty("--story-slide-direction", String(direction));
  lastStoryCanvasIndex = -1;

  const draw = (now) => {
    const t = clamp01((now - startedAt) / storyTransitionDuration);
    const fade = easeInOutCubic(t);
    const drift = easeOutCubic(t);
    const glow = Math.sin(Math.PI * t);
    const ratio = 1;
    const canvasWidth = storyCanvas.width / ratio;
    const canvasHeight = storyCanvas.height / ratio;
    const travel = Math.min(canvasWidth * 0.075, 118);
    const fromShift = direction * -travel * drift;
    const toShift = direction * travel * (1 - drift);
    const fromOpacity = 1 - fade;
    const toOpacity = fade;

    storyCanvasContext.save();
    paintStoryCanvasBase();
    drawCoverImage(storyCanvasImages[from], fromOpacity, fromShift, 0, 1.06 + fade * 0.012);
    storyCanvasContext.globalAlpha = 0.08 * glow;
    storyCanvasContext.fillStyle = "#050607";
    storyCanvasContext.fillRect(0, 0, canvasWidth, canvasHeight);
    drawCoverImage(storyCanvasImages[to], toOpacity, toShift, 0, 1.075 - fade * 0.022);
    drawStorySweep(canvasWidth * (0.5 + direction * 0.06 * (1 - fade)), direction, glow * 0.18);
    storyCanvasContext.restore();
    storyCanvasContext.globalAlpha = 1;

    if (t < 1) {
      storyTransitionFrame = window.requestAnimationFrame(draw);
      return;
    }

    storyTransitioning = false;
    storyTransitionFrame = 0;
    story?.classList.remove("is-transitioning");
    renderStoryCanvas(to);
  };

  storyTransitionFrame = window.requestAnimationFrame(draw);
};

const cleanStoryLayer = (layer, isActive) => {
  layer.classList.toggle("is-active", isActive);
  layer.classList.remove("is-entering", "is-leaving", "is-ready");
};

const setStoryStripIndex = (index) => {
  storyCompositor?.style.setProperty("--story-frame-index", String(index));
  if (storyImageLayers.length) {
    storyCompositor?.style.setProperty("--story-strip-x", `${index * (-100 / storyImageLayers.length)}%`);
  }
  storyImageLayers.forEach((layer, layerIndex) => {
    cleanStoryLayer(layer, layerIndex === index);
  });
};

const renderStoryLayer = (index) => {
  if (!storyCompositorReady || !storyImageLayers.length) return;

  const activeIndex = Math.min(storyImageLayers.length - 1, Math.max(0, index));

  if (activeIndex === lastStoryLayerIndex && !storyTransitioning) return;
  window.cancelAnimationFrame(storyTransitionFrame);
  window.clearTimeout(storyTransitionTimer);
  storyTransitionFrame = 0;
  storyTransitionTimer = 0;
  storyTransitioning = false;
  story?.classList.remove("is-transitioning");
  lastStoryLayerIndex = activeIndex;
  setStoryStripIndex(activeIndex);
};

const finishStoryLayerTransition = (activeIndex) => {
  storyTransitioning = false;
  storyTransitionTimer = 0;
  lastStoryLayerIndex = activeIndex;
  story?.classList.remove("is-transitioning");
  setStoryStripIndex(activeIndex);
};

const transitionStoryLayers = (fromIndex, toIndex) => {
  if (!storyCompositorReady || !storyImageLayers.length || fromIndex === toIndex) {
    renderStoryLayer(toIndex);
    return;
  }

  const maxLayerIndex = storyImageLayers.length - 1;
  const from = Math.min(maxLayerIndex, Math.max(0, fromIndex));
  const to = Math.min(maxLayerIndex, Math.max(0, toIndex));
  const direction = to > from ? 1 : -1;

  window.cancelAnimationFrame(storyTransitionFrame);
  window.clearTimeout(storyTransitionTimer);
  storyTransitionFrame = 0;
  storyTransitioning = true;
  lastStoryLayerIndex = -1;
  story?.classList.add("is-transitioning");
  story?.style.setProperty("--story-slide-direction", String(direction));
  setStoryStripIndex(to);

  storyTransitionTimer = window.setTimeout(() => {
    finishStoryLayerTransition(to);
  }, storyTransitionDuration + 40);
};

const updateStoryProgressDisplay = (index) => {
  const progress = getStoryProgressForIndex(index);

  renderedStoryProgress = progress;
  story.style.setProperty("--stage-pan", progress.toFixed(4));
  story.style.setProperty("--story-progress", progress.toFixed(4));

  if (storyProgress) {
    storyProgress.style.transform = `scaleX(${progress})`;
  }

  const maxIndex = Math.max(getMaxStoryIndex(), 1);
  const nextPercent = Math.round((index / maxIndex) * 100);
  if (storyPercent && nextPercent !== lastStoryPercent) {
    storyPercent.textContent = `${String(nextPercent).padStart(2, "0")}%`;
    lastStoryPercent = nextPercent;
  }
};

const updateStoryScene = (activeIndex) => {
  if (!storyScenes.length) return;

  const activeScene = storyScenes[activeIndex];
  const previousIndex = lastStoryTextIndex;
  const direction = previousIndex === -1 ? 1 : Math.sign(activeIndex - previousIndex) || 1;

  updateStoryProgressDisplay(activeIndex);

  if (activeIndex !== previousIndex) {
    lastStoryTextIndex = activeIndex;

    storyScenes.forEach((scene, index) => {
      const isActiveText = index === activeIndex;
      const isLeaving = index === previousIndex && previousIndex !== -1;
      const leaveToken = `${Date.now()}-${activeIndex}`;

      scene.classList.toggle("is-rendered", isActiveText);
      scene.classList.toggle("is-leaving", isLeaving);
      scene.style.setProperty("--scene-layer", isActiveText ? "20" : isLeaving ? "18" : "1");
      scene.style.setProperty("--media-opacity", storyCompositorReady || storyCanvasReady ? "0" : isActiveText ? "1" : "0");
      scene.style.setProperty("--scene-y", "0px");

      if (isActiveText) {
        const enterToken = `${Date.now()}-${activeIndex}`;
        scene.dataset.enterToken = enterToken;
        scene.style.setProperty("--content-opacity", "0");
        scene.style.setProperty("--content-x", `${34 * direction}px`);
        scene.style.setProperty("--content-y", "10px");
        scene.style.setProperty("--content-rotate", "0deg");

        window.setTimeout(() => {
          if (scene.dataset.enterToken !== enterToken || index !== storyIndex) return;

          scene.style.setProperty("--content-opacity", "1");
          scene.style.setProperty("--content-x", "0px");
          scene.style.setProperty("--content-y", "0px");
          scene.style.setProperty("--content-rotate", "0deg");
        }, storyTextEnterDelay);
      } else if (isLeaving) {
        scene.dataset.leaveToken = leaveToken;
        scene.style.setProperty("--content-opacity", "0");
        scene.style.setProperty("--content-x", `${-30 * direction}px`);
        scene.style.setProperty("--content-y", "-8px");
        scene.style.setProperty("--content-rotate", "0deg");

        window.setTimeout(() => {
          if (scene.dataset.leaveToken === leaveToken && index !== storyIndex) {
            scene.classList.remove("is-leaving");
            scene.style.setProperty("--scene-layer", "1");
            scene.style.setProperty("--content-x", "0px");
            scene.style.setProperty("--content-y", "0px");
            scene.style.setProperty("--content-rotate", "0deg");
          }
        }, storyTransitionDuration);
      } else {
        scene.style.setProperty("--content-opacity", "0");
        scene.style.setProperty("--content-x", "0px");
        scene.style.setProperty("--content-y", "0px");
        scene.style.setProperty("--content-rotate", "0deg");
      }
    });
  }

  setStage(activeScene.dataset.stage, activeScene.dataset.title);
};

const goToStoryIndex = (targetIndex, options = {}) => {
  if (!storyScenes.length) return;

  const maxIndex = getMaxStoryIndex();
  const nextIndex = Math.min(maxIndex, Math.max(0, targetIndex));
  const previousIndex = storyIndex;
  const didChange = nextIndex !== previousIndex;

  storyIndex = nextIndex;
  updateStoryScene(nextIndex);

  if (didChange) {
    if (nextIndex === maxIndex && nextIndex > previousIndex) {
      armStoryExitHold();
    } else {
      resetStoryExitHold();
    }
  }

  if (didChange && options.transition !== false) {
    if (storyCompositorReady) {
      transitionStoryLayers(previousIndex, nextIndex);
    } else {
      transitionStoryCanvas(previousIndex, nextIndex);
    }
  } else {
    if (storyCompositorReady) {
      renderStoryLayer(nextIndex);
    } else {
      renderStoryCanvas(nextIndex);
    }
  }

  if (options.scroll) {
    storyScrollLockUntil = window.performance.now() + storyTransitionDuration + 120;
    scrollToStoryIndex(nextIndex);
  }
};

const renderStoryFrame = (progress, options = {}) => {
  if (storyScenes.length) {
    const activeIndex = getStoryIndexFromProgress(progress);
    goToStoryIndex(activeIndex, {
      scroll: false,
      transition: options.transition === true
    });
    return;
  }

  const stageIndex = Math.min(chapters.length - 1, Math.max(0, Math.round(progress * Math.max(chapters.length - 1, 1))));
  const stageChapter = chapters[stageIndex];
  if (stageChapter) {
    setStage(stageChapter.dataset.stage, stageChapter.dataset.title);
  }
};

const updateStoryMotion = () => {
  if (!story) return false;

  const progress = getStoryProgressFromScroll();
  const isActive = isStoryOnScreen();
  document.body.classList.toggle("is-story-active", isActive);

  if (!isActive) {
    renderStoryFrame(progress <= 0 ? 0 : 1, { transition: false });
    return false;
  }

  if (storyTransitioning || window.performance.now() < storyScrollLockUntil) {
    updateStoryScene(storyIndex);
    return true;
  }

  updateStoryScene(storyIndex);
  return true;
};

const stepStoryFromGesture = (direction) => {
  if (!canStepStory(direction)) return false;

  const nextIndex = Math.min(getMaxStoryIndex(), Math.max(0, storyIndex + direction));
  goToStoryIndex(nextIndex, {
    scroll: false,
    transition: true
  });
  storyScrollLockUntil = window.performance.now() + storyTransitionDuration + 120;
  return true;
};

const handleStoryWheel = (event) => {
  if (!isStoryGestureZone() || Math.abs(event.deltaY) <= Math.abs(event.deltaX)) {
    storyWheelDelta = 0;
    return;
  }

  const inputDirection = event.deltaY > 0 ? 1 : -1;
  if (shouldHoldStoryExit(inputDirection)) {
    storyWheelDelta = 0;
    if (consumeStoryExitHold(event.deltaY)) {
      event.preventDefault();
    }
    return;
  }

  if (!canStepStory(inputDirection)) {
    storyWheelDelta = 0;
    return;
  }

  event.preventDefault();

  if (storyTransitioning || window.performance.now() < storyScrollLockUntil) return;

  if (Math.sign(storyWheelDelta) !== Math.sign(event.deltaY)) {
    storyWheelDelta = 0;
  }

  storyWheelDelta += event.deltaY;

  if (Math.abs(storyWheelDelta) < storyGestureThreshold) return;

  const direction = storyWheelDelta > 0 ? 1 : -1;
  storyWheelDelta = 0;
  stepStoryFromGesture(direction);
};

const handleStoryTouchStart = (event) => {
  const touch = event.touches[0];
  if (!touch) return;

  storyTouchStartX = touch.clientX;
  storyTouchStartY = touch.clientY;
  storyTouchHandled = false;
};

const handleStoryTouchMove = (event) => {
  if (storyTouchHandled || !isStoryGestureZone()) return;

  const touch = event.touches[0];
  if (!touch) return;

  const deltaX = storyTouchStartX - touch.clientX;
  const deltaY = storyTouchStartY - touch.clientY;

  if (Math.abs(deltaY) < 48 || Math.abs(deltaY) <= Math.abs(deltaX) * 1.2) return;

  const direction = deltaY > 0 ? 1 : -1;
  if (shouldHoldStoryExit(direction)) {
    if (consumeStoryExitHold(deltaY)) {
      if (event.cancelable) {
        event.preventDefault();
      }
      storyTouchHandled = true;
    }
    return;
  }

  if (!canStepStory(direction)) return;

  if (event.cancelable) {
    event.preventDefault();
  }

  storyTouchHandled = true;

  if (storyTransitioning || window.performance.now() < storyScrollLockUntil) return;

  stepStoryFromGesture(direction);
};

const handleStoryTouchEnd = () => {
  storyTouchHandled = false;
};

const updateCinematicItems = () => {
  cinematicItems.forEach((item) => {
    const box = item.getBoundingClientRect();
    const center = box.top + box.height / 2;
    const distance = (center - window.innerHeight / 2) / window.innerHeight;
    const shift = Math.max(-1, Math.min(1, distance));
    const depth = 1 - Math.min(Math.abs(shift), 1);
    const abs = Math.abs(shift);

    item.style.setProperty("--cinematic-shift", shift.toFixed(4));
    item.style.setProperty("--cinematic-abs", abs.toFixed(4));
    item.style.setProperty("--cinematic-depth", depth.toFixed(4));
    item.style.setProperty("--cinematic-row-x", `${(shift * 34).toFixed(2)}px`);
    item.style.setProperty("--cinematic-row-z", `${(depth * 54).toFixed(2)}px`);
    item.style.setProperty("--cinematic-row-rotate", `${(shift * -3).toFixed(3)}deg`);
    item.style.setProperty("--cinematic-art-x", `${(shift * -34).toFixed(2)}px`);
    item.style.setProperty("--cinematic-art-y", `${(shift * 28).toFixed(2)}px`);
    item.style.setProperty("--cinematic-art-rotate", `${(shift * -9).toFixed(3)}deg`);
    item.style.setProperty("--cinematic-y", `${(shift * 34).toFixed(2)}px`);
    item.style.setProperty("--cinematic-z", `${(depth * 60).toFixed(2)}px`);
    item.style.setProperty("--cinematic-rotate-x", `${(shift * -3.2).toFixed(3)}deg`);
    item.style.setProperty("--cinematic-scale", (1 - abs * 0.018).toFixed(4));
    item.style.setProperty("--cinematic-image-x", `${(shift * -58).toFixed(2)}px`);
    item.style.setProperty("--cinematic-image-y", `${(shift * -24).toFixed(2)}px`);
    item.style.setProperty("--cinematic-copy-x", `${(shift * 58).toFixed(2)}px`);
  });
};

const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
      }
    });
  },
  { threshold: 0.18 }
);

reveals.forEach((item) => revealObserver.observe(item));

const setStage = (index, title) => {
  if (activeStage === index) return;
  activeStage = index;
  const current = Number(index) + 1;

  stageImages.forEach((image) => {
    const imageIndex = Number(image.dataset.stageImage);
    image.classList.toggle("is-active", image.dataset.stageImage === index);
    image.classList.toggle("is-before", imageIndex < current);
  });

  stageDots.forEach((dot) => {
    dot.classList.toggle("is-active", dot.dataset.stageDot === index);
  });

  chapters.forEach((chapter) => {
    chapter.classList.toggle("is-current", chapter.dataset.stage === index);
  });

  if (stageCount) {
    stageCount.textContent = `${String(current).padStart(2, "0")} / 04`;
  }

  if (stageTitle) {
    stageTitle.textContent = title;
  }
};

chapters[0]?.classList.add("is-current");

const requestTick = () => {
  if (ticking) return;

  ticking = true;
  window.requestAnimationFrame(() => {
    setProgress();
    ticking = false;
  });
};

const handleInternalNavigation = (event) => {
  const link = event.currentTarget;
  const targetId = link.getAttribute("href")?.slice(1);
  const target = targetId ? document.getElementById(targetId) : null;
  if (!target) return;

  document.body.classList.add("is-navigating");
  window.setTimeout(() => {
    document.body.classList.remove("is-navigating");
  }, 760);
};

document.querySelectorAll("a[href^='#']").forEach((link) => {
  link.addEventListener("click", handleInternalNavigation);
});

window.addEventListener("scroll", requestTick, { passive: true });
window.addEventListener("wheel", handleStoryWheel, { passive: false });
window.addEventListener("touchstart", handleStoryTouchStart, { passive: true });
window.addEventListener("touchmove", handleStoryTouchMove, { passive: false });
window.addEventListener("touchend", handleStoryTouchEnd, { passive: true });
window.addEventListener("resize", () => {
  measureLayout();
  setProgress();
});
window.addEventListener("hashchange", revealVisibleItems);
premiereSkip?.addEventListener("click", skipPremiere);
languageButtons.forEach((button) => {
  button.addEventListener("click", () => applyLanguage(button.dataset.lang));
});
articleCards.forEach((card) => {
  card.addEventListener("click", () => updateArticleReader(card));
});
articleOpen?.addEventListener("click", openArticleModal);
articleCloseButtons.forEach((button) => {
  button.addEventListener("click", closeArticleModal);
});
window.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    closeArticleModal();
  }
});
articleCards[0]?.setAttribute("aria-current", "true");
if (activeArticleCard) {
  applyArticleImage(articleReader?.querySelector("[data-article-image]"), activeArticleCard);
}
applyLanguage(currentLanguage, false);
warmStageImages();
preloadArticleImages();
measureLayout();
setProgress();
window.setTimeout(revealVisibleItems, 120);
prepareCriticalAssets().then(() => {
  window.setTimeout(hidePremiere, 180);
});
window.addEventListener("load", () => {
  measureLayout();
  setProgress();
});
