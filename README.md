# Dashboard KPI tháng 09/2026

Dashboard tĩnh được tạo từ workbook `T9.26_Tracking KPI.xlsx`. Dữ liệu đã được đóng gói trong `data.js`, vì vậy trang không cần máy chủ cơ sở dữ liệu.

Dashboard gồm Tổng quan KPI, ba chương trình Tăng doanh số, MBS, Trưng bày, MCP và Doanh số & ASO. Tab Doanh số & ASO hiển thị theo từng phường; mở mỗi phường để xem chi tiết các DDKD. Tiến độ và tỷ lệ phần trăm giữ số lẻ theo dữ liệu nguồn.

## Xem nhanh

Mở `index.html` bằng trình duyệt, hoặc chạy một web server tĩnh trong thư mục này.

## Triển khai GitHub Pages

1. Tạo repository mới và đưa toàn bộ các file ở thư mục này lên nhánh `main`.
2. Vào **Settings → Pages**.
3. Chọn **Deploy from a branch**, nhánh `main`, thư mục `/ (root)`, rồi lưu.

GitHub sẽ cấp một đường dẫn dạng `https://ten-tai-khoan.github.io/ten-repository/`.

## Cập nhật dữ liệu

Chạy lại công cụ trích xuất với workbook mới để tạo lại `data.js`, sau đó tải file này lên repository và triển khai lại.
