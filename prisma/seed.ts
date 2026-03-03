import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient, ProductType } from "@generated/prisma/client";

const connectionString = `${process.env.DATABASE_URL}`;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('⏳ Đang tạo dữ liệu mẫu cho Product...');

  await prisma.product.createMany({
    data: [
      // ---------------- PHỤ TÙNG (PART) ----------------
      {
        code: 'PT-NHOT-CAS',
        name: 'Nhớt Castrol Magnatec 10W-40',
        price: 150000,
        costPrice: 110000,
        stock: 50,
        unit: 'Lít',
        type: ProductType.PART,
      },
      {
        code: 'PT-LOC-INOVA',
        name: 'Lọc nhớt Toyota Innova',
        price: 250000,
        costPrice: 180000,
        stock: 20,
        unit: 'Cái',
        type: ProductType.PART,
      },
      {
        code: 'PT-MA-CIVIC',
        name: 'Má phanh trước Honda Civic',
        price: 850000,
        costPrice: 600000,
        stock: 10,
        unit: 'Bộ',
        type: ProductType.PART,
      },
      {
        code: 'PT-NUOC-AISIN',
        name: 'Nước làm mát động cơ Aisin',
        price: 120000,
        costPrice: 850000,
        stock: 30,
        unit: 'Lít',
        type: ProductType.PART,
      },
      {
        code: 'PT-LOP-MICHELIN',
        name: 'Lốp Michelin 205/55R16',
        price: 2500000,
        costPrice: 2100000,
        stock: 16,
        unit: 'Cái',
        type: ProductType.PART,
      },

      // ---------------- DỊCH VỤ (SERVICE) ----------------
      {
        code: 'DV-THAY-NHOT',
        name: 'Công thay nhớt, lọc nhớt',
        price: 50000,
        costPrice: 0,
        stock: 0, // Dịch vụ không có tồn kho
        unit: 'Lần',
        type: ProductType.SERVICE,
      },
      {
        code: 'DV-RUA-XE',
        name: 'Rửa xe bọt tuyết, hút bụi',
        price: 70000,
        costPrice: 0,
        stock: 0,
        unit: 'Lần',
        type: ProductType.SERVICE,
      },
      {
        code: 'DV-BAO-DUONG-PHANH',
        name: 'Bảo dưỡng, vệ sinh phanh 4 bánh',
        price: 200000,
        costPrice: 0,
        stock: 0,
        unit: 'Lần',
        type: ProductType.SERVICE,
      },
      {
        code: 'DV-CAN-MAM',
        name: 'Cân bằng động mâm lốp',
        price: 50000,
        costPrice: 0,
        stock: 0,
        unit: 'Bánh',
        type: ProductType.SERVICE,
      },
    ],
    skipDuplicates: true, // Bỏ qua nếu mã code đã tồn tại (tránh lỗi khi chạy lệnh nhiều lần)
  });

  console.log('✅ Đã tạo dữ liệu Product thành công!');
}

main()
  .then(async () => {
    await prisma.$disconnect();
    await pool.end();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    await pool.end();
    process.exit(1);
  });