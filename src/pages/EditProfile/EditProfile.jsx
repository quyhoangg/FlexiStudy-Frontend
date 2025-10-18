import React, { useState, useEffect } from "react";
import { 
  Form, 
  Input, 
  Button, 
  Avatar, 
  Upload, 
  message,
  Row,
  Col,
  Card,
  Typography,
  Divider,
  Spin,
  Tabs,
  DatePicker,
  Space
} from "antd";
import dayjs from "dayjs";
import { 
  UserOutlined, 
  CameraOutlined,
  ArrowLeftOutlined, 
  DeleteOutlined,
  PlusOutlined
} from "@ant-design/icons";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { uploadAvatarAPI, updateUserAPI, getMyProfileAPI, updateMyProfileAPI } from "../../apis";
import { setUser } from "../../redux/userSlice";
import { setLayoutData } from "../../redux/layoutSlice";
import { getMyInfo } from '../../redux/userSlice';
import "./EditProfile.css";
import TabPane from "antd/es/tabs/TabPane";

const { Title, Text } = Typography;

const EditProfile = () => {
  const [form] = Form.useForm();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const user = useSelector((state) => state.user);

  const [loading, setLoading] = useState(false);
  const [loadingUser, setLoadingUser] = useState(false);

  const [imageUrl, setImageUrl] = useState(user.avatarUrl || "");
  const [uploadingImage, setUploadingImage] = useState(false);
  const [imageKey, setImageKey] = useState(Date.now()); // Force re-render


  useEffect(() => {
    const loadProfile = async () => {
      try {
        setLoadingUser(true);
        const res = await getMyProfileAPI();
        console.log("Profile response:", res.result);
        if (res?.code === 1000) {
          const p = res.result || {};
          // Map ngày → dayjs cho DatePicker
          const experiences = (p.experiences || []).map((e) => ({
            ...e,
            startDate: e.startDate ? dayjs(e.startDate) : null,
            endDate: e.endDate ? dayjs(e.endDate) : null,
          }));

          // Đổ form
          form.setFieldsValue({
            firstName: p.firstName || "",
            lastName: p.lastName || "",
            email: p.email || "",
            phone: p.phone || "",
            address: p.address || "",
            dob: p.dob ? dayjs(p.dob) : null,
            educations: p.educations && p.educations.length ? p.educations : [{}],
            experiences: experiences.length ? experiences : [{}],
          });

          setImageUrl(p.avatarUrl || "");
          console.log("✅ Image URL set to:", p.avatarUrl);
          setImageKey(Date.now());

          // (tuỳ) đồng bộ Redux user “cơ bản”
          // dispatch(setUser({ ...user, ...p, fullName: `${p.firstName || ""} ${p.lastName || ""}`.trim() }));
        } else {
          message.error(res?.message || "Không lấy được hồ sơ");
        }
      } catch (err) {
        console.error(err);
        message.error("Không lấy được hồ sơ");
      } finally {
        setLoadingUser(false);
      }
    };
    loadProfile();
  }, []);


  useEffect(() => {
    dispatch(
      setLayoutData({
        title: "Chỉnh sửa thông tin cá nhân",
        icon: <UserOutlined />,
      })
    );
  }, [dispatch]);

  // Sync imageUrl with user.avatarUrl when user data changes
  useEffect(() => {
    if (user.avatarUrl) {
      setImageUrl(user.avatarUrl);
      setImageKey(Date.now()); 
    }
  }, [user.avatarUrl]);

  // Handle image upload
  const handleAvatarUpload = async (file) => {
    setUploadingImage(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const response = await uploadAvatarAPI(user?.id, formData);
      console.log("Upload avatar response:", response);
      if (response.data.code === 1000) {
        const newAvatarUrl = response.data.result;
        setImageUrl(newAvatarUrl);
        message.success("Tải lên ảnh đại diện thành công!");
      } else {
        message.error("Tải lên ảnh đại diện thất bại!");
      }
    } catch (error) {
      console.error("Upload avatar error:", error);
      message.error("Tải lên ảnh đại diện thất bại!");
    } finally {
      setUploadingImage(false);
    }
    return false;
};
  // Handle form submission
  // const handleSubmit = async (values) => {
  //   if (!user?.id) {
  //   message.error("Không thể cập nhật vì thiếu ID người dùng");
  //   return;
  // }
  //   setLoading(true);
  //   try {
  //     const updatePayload = {
  //       ...values,
  //       avatarUrl: imageUrl
  //     };

  //     const response = await updateUserAPI(user.id, updatePayload);
  //     console.log("Update user response:", response);
      
  //     if (response.code === 1000) {
  //       // Update Redux store
  //       dispatch(setUser({
  //         ...user,
  //         ...updatePayload,
  //         fullName: `${values.firstName} ${values.lastName}`
  //       }));
        
  //       message.success("Cập nhật thông tin thành công!");
  //       navigate(-1); // Go back to previous page
  //     } else {
  //       message.error("Cập nhật thông tin thất bại!");
  //     }
  //   } catch (error) {
  //     message.error("Cập nhật thông tin thất bại!");
  //   } finally {
  //     setLoading(false);
  //   }
  // };

   const handleSubmit = async (values) => {
    setLoading(true);
    try {
      // Map lại experiences-> date string
      const experiences = (values.experiences || [])
        .filter((x) => x && (x.company || x.position || x.startDate || x.endDate))
        .map((x) => ({
          ...x,
          startDate: x.startDate ? dayjs(x.startDate).format("YYYY-MM-DD") : null,
          endDate: x.endDate ? dayjs(x.endDate).format("YYYY-MM-DD") : null,
        }));

      const educations = (values.educations || [])
        .filter((x) => x && (x.school || x.degree || x.field));

      const payload = {
        firstName: values.firstName || "",
        lastName: values.lastName || "",
        email: values.email || "",
        phone: values.phone || "",
        address: values.address || "",
        dob: values.dob ? dayjs(values.dob).format("YYYY-MM-DD") : null,
        avatarUrl: imageUrl,
        educations,
        experiences,
      };

      const res = await updateMyProfileAPI(payload);

      if (res?.code === 1000) {
        message.success("Cập nhật thông tin thành công!");

        // Gọi API lấy lại thông tin user hoặc dùng result trả về
        const updatedProfile = res.result || {};

        // Cập nhật Redux user ngay
        dispatch(setUser({
          ...user,
          ...updatedProfile,
          fullName: `${updatedProfile.firstName || ""} ${updatedProfile.lastName || ""}`.trim(),
          avatarUrl: updatedProfile.avatarUrl || imageUrl,
        }));

        navigate("/"); // hoặc navigate(-1)
      }
      else {
        message.error(res?.message || "Cập nhật thất bại!");
      }
    } catch (e) {
      console.error(e);
      message.error("Cập nhật thất bại!");
    } finally {
      setLoading(false);
    }
  };


return (
    <div className="edit-profile-page">
      <div className="edit-profile-header">
        <Button
          type="text"
          icon={<ArrowLeftOutlined />}
          onClick={() => navigate(-1)}
          className="back-button"
        >
          Quay lại
        </Button>
      </div>

      <Row gutter={24}>
        <Col xs={24} lg={8}>
          <Card className="avatar-card">
            <div className="avatar-section">
              <Avatar
                size={150}
                src={imageUrl || user.avatarUrl}
                icon={<UserOutlined />}
                className="profile-avatar"
              />
              <Upload
                name="avatar"
                beforeUpload={handleAvatarUpload}
                showUploadList={false}
                accept="image/*"
              >
                <Button
                  style={{ color: "white" }}
                  icon={<CameraOutlined />}
                  loading={uploadingImage}
                  className="upload-button"
                  type="primary"
                  ghost
                >
                  {uploadingImage ? "Đang upload..." : "Thay đổi ảnh"}
                </Button>
              </Upload>
            </div>

            <Divider />

            <div className="user-info">
              <Title level={4}>{user.fullName || user.username || "Người dùng"}</Title>
              <Text type="secondary">
                {user.role || user.roles?.map((r) => r.name).join(", ") || "Chưa có quyền"}
              </Text>
              <br />
              <Text type="secondary">{user.email || "Chưa cung cấp"}</Text>
            </div>
          </Card>
        </Col>

        <Col xs={24} lg={16}>
          <Card className="form-card">
            <Spin spinning={loadingUser}>
              <Form form={form} layout="vertical" onFinish={handleSubmit}>
                <Tabs defaultActiveKey="1">
                  <TabPane tab="Hồ sơ cá nhân" key="1">
                    <Row gutter={16}>
                      <Col span={12}>
                        <Form.Item
                          label="Họ"
                          name="firstName"
                          rules={[{ required: true, message: "Vui lòng nhập họ!" }]}
                        >
                          <Input placeholder="Nhập họ" size="large" />
                        </Form.Item>
                      </Col>
                      <Col span={12}>
                        <Form.Item
                          label="Tên"
                          name="lastName"
                          rules={[{ required: true, message: "Vui lòng nhập tên!" }]}
                        >
                          <Input placeholder="Nhập tên" size="large" />
                        </Form.Item>
                      </Col>
                    </Row>

                    <Row gutter={16}>
                      <Col span={12}>
                        <Form.Item
                          label="Email"
                          name="email"
                          rules={[
                            { required: true, message: "Vui lòng nhập email!" },
                            { type: "email", message: "Email không hợp lệ!" },
                          ]}
                        >
                          <Input placeholder="Nhập email" size="large" />
                        </Form.Item>
                      </Col>
                      <Col span={12}>
                        <Form.Item
                          label="Số điện thoại"
                          name="phone"
                          rules={[{ required: true, message: "Vui lòng nhập số điện thoại!" }]}
                        >
                          <Input placeholder="Nhập số điện thoại" size="large" />
                        </Form.Item>
                      </Col>
                    </Row>

                    <Row gutter={16}>
                      <Col span={12}>
                        <Form.Item label="Ngày sinh" name="dob">
                          <DatePicker format="YYYY-MM-DD" style={{ width: "100%" }} />
                        </Form.Item>
                      </Col>
                      <Col span={12}>
                        <Form.Item label="Địa chỉ" name="address">
                          <Input placeholder="Nhập địa chỉ" size="large" />
                        </Form.Item>
                      </Col>
                    </Row>
                  </TabPane>

                  <TabPane tab="Học vấn" key="2">
                    <Form.List name="educations">
                      {(fields, { add, remove }) => (
                        <Card
                          type="inner"
                          title="Học vấn"
                          extra={
                            <Button type="dashed" onClick={() => add({})} icon={<PlusOutlined />}>
                              Thêm học vấn
                            </Button>
                          }
                          style={{ marginBottom: 20 }}
                        >
                          {fields.map(({ key, name, ...rest }) => (
                            <Space
                              key={key}
                              direction="vertical"
                              style={{
                                display: "flex",
                                marginBottom: 10,
                                padding: 15,
                                border: "1px solid #eee",
                                borderRadius: 10,
                              }}
                            >
                              <Row gutter={16}>
                                <Col span={12}>
                                  <Form.Item
                                    {...rest}
                                    name={[name, "school"]}
                                    label="Trường học"
                                    rules={[{ required: true, message: "Nhập tên trường" }]}
                                  >
                                    <Input />
                                  </Form.Item>
                                </Col>
                                <Col span={12}>
                                  <Form.Item name={[name, "degree"]} label="Bằng cấp">
                                    <Input />
                                  </Form.Item>
                                </Col>
                              </Row>
                              <Form.Item name={[name, "field"]} label="Chuyên ngành">
                                <Input />
                              </Form.Item>
                              <Button
                                danger
                                type="link"
                                icon={<DeleteOutlined />}
                                onClick={() => remove(name)}
                              >
                                Xóa
                              </Button>
                            </Space>
                          ))}
                        </Card>
                      )}
                    </Form.List>
                  </TabPane>

                  <TabPane tab="Kinh nghiệm làm việc" key="3">
                    <Form.List name="experiences">
                      {(fields, { add, remove }) => (
                        <Card
                          type="inner"
                          title="Kinh nghiệm làm việc"
                          extra={
                            <Button type="dashed" onClick={() => add({})} icon={<PlusOutlined />}>
                              Thêm kinh nghiệm
                            </Button>
                          }
                          style={{ marginBottom: 20 }}
                        >
                          {fields.map(({ key, name, ...rest }) => (
                            <Space
                              key={key}
                              direction="vertical"
                              style={{
                                display: "flex",
                                marginBottom: 10,
                                padding: 15,
                                border: "1px solid #eee",
                                borderRadius: 10,
                              }}
                            >
                              <Row gutter={16}>
                                <Col span={12}>
                                  <Form.Item
                                    {...rest}
                                    name={[name, "company"]}
                                    label="Công ty / Doanh nghiệp"
                                    rules={[{ required: true, message: "Nhập tên công ty" }]}
                                  >
                                    <Input />
                                  </Form.Item>
                                </Col>
                                <Col span={12}>
                                  <Form.Item
                                    {...rest}
                                    name={[name, "position"]}
                                    label="Chức vụ"
                                  >
                                    <Input />
                                  </Form.Item>
                                </Col>
                              </Row>
                              <Row gutter={16}>
                                <Col span={12}>
                                  <Form.Item name={[name, "startDate"]} label="Từ ngày">
                                    <DatePicker format="YYYY-MM-DD" style={{ width: "100%" }} />
                                  </Form.Item>
                                </Col>
                                <Col span={12}>
                                  <Form.Item name={[name, "endDate"]} label="Đến ngày">
                                    <DatePicker format="YYYY-MM-DD" style={{ width: "100%" }} />
                                  </Form.Item>
                                </Col>
                              </Row>
                              <Button
                                danger
                                type="link"
                                icon={<DeleteOutlined />}
                                onClick={() => remove(name)}
                              >
                                Xóa
                              </Button>
                            </Space>
                          ))}
                        </Card>
                      )}
                    </Form.List>
                  </TabPane>
                  <TabPane tab="Nâng cấp tài khoản" key="4">
  <Row gutter={24}>
    <Col xs={24} md={12}>
      <Card
        title="Premium"
        style={{ backgroundColor: "#f0f5ff", borderRadius: 12 }}
      >
        <Title level={3} style={{ color: "#1d39c4" }}>
          49.000đ/tháng
        </Title>
        <p>Dành cho sinh viên muốn tăng khả năng hiển thị hồ sơ...</p>
        <ul>
          <li>🔹 Đề xuất theo năng lực & khung giờ rảnh</li>
          <li>🔹 Ưu tiên hiển thị hồ sơ</li>
          <li>🔹 Nhắn tin trực tiếp với nhà tài trợ</li>
          <li>🔹 Báo cáo hiệu quả & phân tích dự án</li>
        </ul>
        <Button type="primary" size="large" block style={{ marginTop: 12 }}>
          Đăng ký ngay
        </Button>
      </Card>
    </Col>

    <Col xs={24} md={12}>
      <Card
        title="Career Pro Plan"
        style={{ backgroundColor: "#d6e4ff", borderRadius: 12 }}
      >
        <Title level={3} style={{ color: "#10239e" }}>
          99.000đ/tháng
        </Title>
        <p>Dành cho sinh viên nghiêm túc đầu tư vào sự nghiệp...</p>
        <ul>
          <li>✅ Phân tích hiệu suất ứng tuyển</li>
          <li>✅ CV review định kỳ (AI hoặc mentor)</li>
          <li>✅ Gợi ý lộ trình nghề nghiệp</li>
          <li>✅ Khóa học kỹ năng mềm tích hợp</li>
        </ul>
        <Button
          type="primary"
          size="large"
          block
          style={{ marginTop: 12, backgroundColor: "#1d39c4" }}
        >
          Đăng ký ngay
        </Button>
      </Card>
    </Col>
  </Row>
</TabPane>

                </Tabs>
                <Form.Item className="form-buttons" style={{ marginTop: 24 }}>
                  <Button onClick={() => navigate("/change-password")} size="large" style={{ marginRight: 16 }}>
                    Đổi mật khẩu
                  </Button>
                  <Button onClick={() => navigate(-1)} size="large" style={{ marginRight: 16 }}>
                    Hủy
                  </Button>
                  <Button type="primary" htmlType="submit" loading={loading} size="large">
                    Lưu thay đổi
                  </Button>
                </Form.Item>
              </Form>
            </Spin>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default EditProfile; 
