<!DOCTYPE html>
<html lang="vi">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Mẫu CV Xin Việc | Viecoi</title>
    <meta name="description"
        content="Khám phá kho mẫu CV chuyên nghiệp, chuẩn bố cục tuyển dụng, sẵn sàng cho mọi vị trí ứng tuyển.">
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet">
    <link rel="stylesheet" href="style.css?v=<?php echo @filemtime('style.css') ?: '6'; ?>">
    <link rel="stylesheet" href="cv-templates.css?v=<?php echo @filemtime('cv-templates.css') ?: '2'; ?>">
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Be+Vietnam+Pro:wght@400&family=Roboto:wght@400;700&display=swap" rel="stylesheet">
</head>

<body class="cv-templates-body">
    <!-- HEADER (giữ nguyên header của landing page index.php) -->
    <header class="header">
        <div class="header-container container">
            <div class="header-left">
                <a href="index.php" class="logo-group">
                    <span class="logo-text">Viecoi</span>
                </a>
                <nav class="main-nav">
                    <a href="#" class="nav-item">Tìm việc <svg class="chevron-icon" viewBox="0 0 16 16" fill="none"
                            xmlns="http://www.w3.org/2000/svg">
                            <path d="M4 6L8 10L12 6" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"
                                stroke-linejoin="round" />
                        </svg></a>
                    <a href="#" class="nav-item">Công ty <svg class="chevron-icon" viewBox="0 0 16 16" fill="none"
                            xmlns="http://www.w3.org/2000/svg">
                            <path d="M4 6L8 10L12 6" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"
                                stroke-linejoin="round" />
                        </svg></a>
                    <a href="#" class="nav-item">Cẩm nang <svg class="chevron-icon" viewBox="0 0 16 16" fill="none"
                            xmlns="http://www.w3.org/2000/svg">
                            <path d="M4 6L8 10L12 6" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"
                                stroke-linejoin="round" />
                        </svg></a>
                    <a href="cv-templates.php" class="nav-item active">Tạo CV <svg class="chevron-icon" viewBox="0 0 16 16" fill="none"
                            xmlns="http://www.w3.org/2000/svg">
                            <path d="M4 6L8 10L12 6" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"
                                stroke-linejoin="round" />
                        </svg></a>
                </nav>
            </div>
            <div class="header-right">
                <div class="lang-selector">
                    <img src="https://flagcdn.com/w20/vn.png" alt="VN" class="flag-icon">
                    <svg class="chevron-icon" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M4 6L8 10L12 6" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"
                            stroke-linejoin="round" />
                    </svg>
                </div>
                <a href="#" class="btn btn-login">Đăng Nhập</a>
                <a href="#" class="btn btn-register">Đăng ký</a>
                <a href="#" class="btn btn-employer">Nhà tuyển dụng <svg class="chevron-icon-white" viewBox="0 0 16 16"
                        fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M4 6L8 10L12 6" stroke="white" stroke-width="1.5" stroke-linecap="round"
                            stroke-linejoin="round" />
                    </svg></a>
            </div>
        </div>
    </header>

    <div class="cv-tpl-page">

        <div class="cv-tpl-close-bar">
            <a href="index.php" class="cv-tpl-close-link">
                <img class="cv-tpl-close-icon" src="assets/icon-close-x.svg" width="20" height="20" alt="">
                Đóng
            </a>
        </div>

        <section class="cv-tpl-hero" aria-labelledby="cv-tpl-hero-title">
            <h1 id="cv-tpl-hero-title" class="cv-tpl-hero-title">Mẫu CV Xin Việc</h1>
            <p class="cv-tpl-hero-desc">Khám phá kho mẫu CV chuyên nghiệp, chuẩn bố cục tuyển dụng, sẵn sàng cho mọi vị trí ứng tuyển.</p>
        </section>

        <main class="cv-tpl-main">
            <div class="cv-tpl-grid" role="list">
                <?php for ($i = 1; $i <= 20; $i++) :
                    $n = str_pad((string) $i, 2, '0', STR_PAD_LEFT);
                    ?>
                <a class="cv-tpl-card" role="listitem" href="cv-editor.php?template=<?php echo htmlspecialchars($n, ENT_QUOTES, 'UTF-8'); ?>">
                    <div class="cv-tpl-card-inner">
                        <div class="cv-tpl-preview">
                            <img src="assets/cv-gallery-<?php echo htmlspecialchars($n, ENT_QUOTES, 'UTF-8'); ?>.png" alt="Mẫu CV Viecoi" width="312" height="440" loading="lazy" decoding="async">
                            <div class="cv-tpl-hover-overlay" aria-hidden="true">
                                <span class="cv-tpl-hover-btn">Sử dụng mẫu này</span>
                            </div>
                        </div>
                        <div class="cv-tpl-meta">
                            <span class="cv-tpl-name">Mẫu tiêu chuẩn</span>
                            <span class="cv-tpl-free">Free</span>
                        </div>
                    </div>
                </a>
                <?php endfor; ?>
            </div>
        </main>
    </div>
</body>

</html>
