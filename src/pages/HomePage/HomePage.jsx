import React, { useEffect, useState } from "react";
import "./HomePage.css";
import {
  Input,
  Button,
  Card,
  Typography,
  Row,
  Col,
  Pagination,
  Spin,
  Tabs,
  Tag,
} from "antd";
import {
  EnvironmentOutlined,
  SearchOutlined,
  ArrowRightOutlined,
  RiseOutlined,
  SafetyOutlined,
  StarTwoTone,
} from "@ant-design/icons";
import banner_home from "../../assets/img/banner12.jpg";
import { getAllJobsAPI, getJobCategoriesAPI } from "../../apis";
import { useNavigate, Link } from "react-router-dom";
import dayjs from "dayjs";
import ChatbotPage from "../ChatBot/ChatbotPage";

const { Title, Text, Paragraph } = Typography;
const { TabPane } = Tabs;

const JobCard = ({ job, onClick }) => {
  const [logoOk, setLogoOk] = useState(!!job.companyLogoUrl);

  const salaryText =
    job.minSalary && job.maxSalary
      ? `${job.minSalary.toLocaleString()} - ${job.maxSalary.toLocaleString()} ${job.currency || "VND"}`
      : job.minSalary
      ? `${job.minSalary.toLocaleString()} ${job.currency || "VND"}`
      : "Thoả thuận";

  const daysLeft = job.expiryDate ? dayjs(job.expiryDate).diff(dayjs(), "day") : null;
  const isExpiringSoon = daysLeft !== null && daysLeft <= 3 && daysLeft >= 0;

  const initials = (job.companyName || "CT")
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <Card
      hoverable
      className="job-card"
      onClick={onClick}
      cover={
        <div className="job-card__cover">
          {logoOk ? (
            <img
              className="job-card__logo-img"
              src={job.companyLogoUrl}
              alt={job.companyName}
              loading="lazy"
              onError={() => setLogoOk(false)} // ❗ lỗi ảnh ⇒ fallback
            />
          ) : (
            <div className="job-card__fallback">
              <span>{initials}</span>
            </div>
          )}

          {isExpiringSoon && (
            <Tag color="error" className="job-card__chip">
              Sắp hết hạn
            </Tag>
          )}
        </div>
      }
    >
      <Card.Meta
        title={<div className="job-card__title">{job.title}</div>}
        description={
          <>
            <div className="job-card__company">{job.companyName}</div>
            <div className="job-card__location">
              <EnvironmentOutlined /> {job.city || "Toàn quốc"}
            </div>
            <div className="job-card__salary">💰 {salaryText}</div>
            {job.expiryDate && (
              <div className="job-card__deadline">
                ⏰ Hạn: {dayjs(job.expiryDate).format("DD/MM/YYYY")}
              </div>
            )}
          </>
        }
      />
    </Card>
  );
};

const HomePage = () => {
  const navigate = useNavigate();
  const [isChatOpen, setIsChatOpen] = useState(false);

  // Shared config
  const pageSize = 8;
  const cityList = ["Tất cả", "Hồ Chí Minh", "Hà Nội", "Đà Nẵng", "Bình Dương"];

  //  Featured (map từ "urgent")
  const [urgentJobs, setUrgentJobs] = useState([]);
  const [pageUrgent, setPageUrgent] = useState(1);
  const [totalUrgent, setTotalUrgent] = useState(0);
  const [cityUrgent, setCityUrgent] = useState("");
  const [loadingUrgent, setLoadingUrgent] = useState(true);

  // Recent (mới nhất)
  const [newestJobs, setNewestJobs] = useState([]);
  const [pageNewest, setPageNewest] = useState(1);
  const [totalNewest, setTotalNewest] = useState(0);
  const [cityNewest, setCityNewest] = useState("");
  const [loadingNewest, setLoadingNewest] = useState(true);

  // Category
  const [categories, setCategories] = useState([]);

//  Fetch tuyển gấp 
const fetchUrgentJobs = async () => {
  try {
    setLoadingUrgent(true);
    const res = await getAllJobsAPI({
      page: pageUrgent,
      size: pageSize,
      city: cityUrgent,
    });

    const now = dayjs();
    const allJobs = res?.result?.data || [];

    // sắp hết hạn (≤ 3 ngày)
    const filtered = allJobs.filter((job) => {
      const daysLeft = job.expiryDate ? dayjs(job.expiryDate).diff(now, "day") : null;
      const isExpiringSoon = daysLeft !== null && daysLeft <= 3 && daysLeft >= 0;
      return job.urgent === true || isExpiringSoon;
    });

    setUrgentJobs(filtered);
    setTotalUrgent(filtered.length); // tính lại total theo filter FE
  } catch (e) {
    console.error("❌ Lỗi tải việc làm tuyển gấp:", e);
  } finally {
    setLoadingUrgent(false);
  }
};


  // Fetch mới nhất
  const fetchNewestJobs = async () => {
    try {
      setLoadingNewest(true);
      const res = await getAllJobsAPI({
        page: pageNewest,
        size: pageSize,
        city: cityNewest,
        urgent: false,
      });
      setNewestJobs(res?.result?.data || []);
      setTotalNewest(res?.result?.totalElements || 0);
    } catch (e) {
      console.error("❌ Lỗi tải việc làm mới nhất:", e);
    } finally {
      setLoadingNewest(false);
    }
  };

  // Fetch category
  const fetchCategories = async () => {
    try {
      const res = await getJobCategoriesAPI();
      setCategories(res?.result || []);
    } catch (e) {
      console.error("❌ Lỗi tải danh mục:", e);
    }
  };

  useEffect(() => {
    fetchUrgentJobs();
  }, [pageUrgent, cityUrgent]);

  useEffect(() => {
    fetchNewestJobs();
  }, [pageNewest, cityNewest]);

  useEffect(() => {
    fetchCategories();
  }, []);

  return (
    <div className="homepage">
      {/* ================= Hero Section ================ */}
      <section className="hero">
        <div className="hero__bg" style={{ backgroundImage: `url(${banner_home})` }} />
        <div className="hero__overlay" />
        <div className="hero__container">
          <div className="hero__badge">
            <StarTwoTone twoToneColor="#1677ff" />{" "}
            <span>Hơn 10,000+ công việc đang chờ bạn</span>
          </div>

          <Title className="hero__title">
            Tìm Công Việc <br /> Mơ Ước Của Bạn
          </Title>

          <Paragraph className="hero__subtitle">
            Khám phá hàng nghìn cơ hội việc làm từ các công ty hàng đầu Việt Nam
          </Paragraph>

          <div className="hero__search">
            <Input
              prefix={<SearchOutlined />}
              placeholder="Tìm kiếm công việc, công ty"
              className="hero__input"
            />
            <Input
              prefix={<EnvironmentOutlined />}
              placeholder="Địa điểm"
              className="hero__input hero__input--location"
            />
            <Button className="hero__button">
              Tìm kiếm
            </Button>
          </div>

          {/* Features */}
          <Row gutter={[16, 16]} className="hero__features">
            <Col xs={24} md={8}>
              <div className="feature-card">
                <div className="feature-card__icon feature-card__icon--primary">
                  <RiseOutlined />
                </div>
                <div className="feature-card__title">Cơ hội tốt nhất</div>
                <div className="feature-card__desc">
                  Các vị trí từ top công ty công nghệ
                </div>
              </div>
            </Col>
            <Col xs={24} md={8}>
              <div className="feature-card">
                <div className="feature-card__icon feature-card__icon--accent">
                  <SafetyOutlined />
                </div>
                <div className="feature-card__title">Uy tín đảm bảo</div>
                <div className="feature-card__desc">
                  Thông tin được xác thực chính xác
                </div>
              </div>
            </Col>
            <Col xs={24} md={8}>
              <div className="feature-card">
                <div className="feature-card__icon feature-card__icon--success">
                  <StarTwoTone twoToneColor="#52c41a" />
                </div>
                <div className="feature-card__title">Dễ dàng ứng tuyển</div>
                <div className="feature-card__desc">
                  Quy trình đơn giản và nhanh chóng
                </div>
              </div>
            </Col>
          </Row>
        </div>
      </section>

      {/* ================= Recent (Mới nhất) ================ */}
      <section className="section section--muted">
        <div className="container">
          <div className="section__head">
            <div>
              <Title level={2} className="section__title">Công việc mới nhất</Title>
              <Text type="secondary">Cập nhật liên tục mỗi ngày</Text>
            </div>
          </div>

          <div className="city-filter-bar">
            {cityList.map((c) => {
              const active = cityNewest === c || (c === "Tất cả" && cityNewest === "");
              return (
                <button
                  key={c}
                  className={active ? "active" : ""}
                  onClick={() => {
                    setCityNewest(c === "Tất cả" ? "" : c);
                    setPageNewest(1);
                  }}
                >
                  {c}
                </button>
              );
            })}
          </div>

          {loadingNewest ? (
            <div className="loading-block">
              <Spin size="large" tip="Đang tải công việc..." />
            </div>
          ) : newestJobs.length === 0 ? (
            <div className="empty-block">Chưa có việc mới.</div>
          ) : (
            <>
              <Row gutter={[16, 16]} align="stretch" className="card-grid">
                {newestJobs.map((job) => (
                  <Col xs={24} sm={12} md={8} lg={6} key={job.id}>
                    <JobCard job={job} onClick={() => navigate(`/jobs/${job.id}`)} />
                  </Col>
                ))}
              </Row>

              <div className="see-more-block">
                <Link to="/jobs">
                  <Button type="primary" size="large" className="see-more-btn">
                    Xem thêm công việc <ArrowRightOutlined />
                  </Button>
                </Link>
              </div>

              <div className="pagination-block">
                <Pagination
                  current={pageNewest}
                  total={totalNewest}
                  pageSize={pageSize}
                  onChange={(p) => setPageNewest(p)}
                  showSizeChanger={false}
                />
              </div>
            </>
          )}
        </div>
      </section>

       {/* ================= Category (theo ngành) ================ */}
      <section className="section container">
        <Title level={3} className="section__title">📂 Việc làm theo ngành</Title>
        <Row gutter={[16, 16]}>
          {categories.map((cat, i) => (
            <Col xs={12} sm={8} md={6} lg={6} key={i}>
              <Card
                hoverable
                className="category-card"
                onClick={() => navigate(`/jobs/category/${encodeURIComponent(cat.category)}`)}
              >
                <div className="category-card__icon">
                  <RiseOutlined />
                </div>
                <Text strong>{cat.category}</Text>
                <br />
                <Text type="secondary">{cat.count} việc làm</Text>
              </Card>
            </Col>
          ))}
        </Row>
      </section>



      {/* ================= Featured (Tuyển gấp) ================ */}
      <section className="section container">
        <div className="section__head">
          <div>
            <Title level={2} className="section__title">Công việc tuyển gấp</Title>
            <Text type="secondary">Những vị trí được nhiều người quan tâm</Text>
          </div>
          <Link to="/jobs">
            <Button type="default" className="section__cta" icon={<ArrowRightOutlined />}>
              Xem tất cả
            </Button>
          </Link>
        </div>

        {/* Filter theo city cho Featured */}
        <div className="city-filter-bar">
          {cityList.map((c) => {
            const active = cityUrgent === c || (c === "Tất cả" && cityUrgent === "");
            return (
              <button
                key={c}
                className={active ? "active" : ""}
                onClick={() => {
                  setCityUrgent(c === "Tất cả" ? "" : c);
                  setPageUrgent(1);
                }}
              >
                {c}
              </button>
            );
          })}
        </div>

        {loadingUrgent ? (
          <div className="loading-block">
            <Spin size="large" tip="Đang tải công việc..." />
          </div>
        ) : urgentJobs.length === 0 ? (
          <div className="empty-block">Chưa có công việc gấp.</div>
        ) : (
          <>
            <Row gutter={[16, 16]} align="stretch" className="card-grid">
              {urgentJobs.map((job) => (
                <Col xs={24} sm={12} md={8} lg={6} key={job.id}>
                  <JobCard job={job} onClick={() => navigate(`/jobs/${job.id}`)} />
                </Col>
              ))}
            </Row>

            <div className="pagination-block">
              <Pagination
                current={pageUrgent}
                total={totalUrgent}
                pageSize={pageSize}
                onChange={(p) => setPageUrgent(p)}
                showSizeChanger={false}
              />
            </div>
          </>
        )}
      </section>
      {/* ================= CTA Section ================ */}
      <section className="cta">
        <div className="container">
          <div className="cta__box">
            <Title level={2} className="cta__title">Sẵn sàng cho bước tiến mới?</Title>
            <Paragraph className="cta__subtitle">
              Hàng nghìn công ty đang tìm kiếm ứng viên như bạn
            </Paragraph>
            <Link to="/jobs">
              <Button size="large" className="cta__button" icon={<ArrowRightOutlined />}>
                Khám phá ngay
              </Button>
            </Link>
          </div>
        </div>
      </section>
      <button
        className="chatbot-button"
        onClick={() => setIsChatOpen(true)}
        title="Chat với AI Assistant"
      >
        💬
      </button>

      {isChatOpen && (
        <div className="chat-modal-overlay" onClick={() => setIsChatOpen(false)}>
          <div className="chat-modal" onClick={(e) => e.stopPropagation()}>
            <div className="chat-header">
              <h3>FlexiStudy Assistant</h3>
              <button onClick={() => setIsChatOpen(false)}>✕</button>
            </div>

            {/* ✅ Thêm phần bọc nội dung chatbot */}
            <div className="chat-body">
              <ChatbotPage />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HomePage;
