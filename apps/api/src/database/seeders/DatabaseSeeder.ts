import { EntityManager } from '@mikro-orm/core';
import { Seeder } from '@mikro-orm/seeder';
import { User, UserRole, UserStatus } from '../../entities/user.entity';
import { Category, CategoryStatus } from '../../entities/category.entity';
import { Store, StoreStatus } from '../../entities/store.entity';
import * as bcrypt from 'bcrypt';

export class DatabaseSeeder extends Seeder {
  async run(em: EntityManager): Promise<void> {
    // Seed admin user
    const hashedPassword = await bcrypt.hash('admin123', 10);
    
    const admin = em.create(User, {
      name: 'Admin',
      email: 'admin@store.vn',
      password: hashedPassword,
      phone: '0900000000',
      role: UserRole.SUPER_ADMIN,
      status: UserStatus.ACTIVE,
    });

    // Seed categories
    const categoryData = [
      {
        name: 'Âm thanh',
        slug: 'am-thanh',
        icon: 'Headphones',
        description: 'Sản phẩm âm thanh chất lượng cao',
        status: CategoryStatus.ACTIVE,
        sortOrder: 1,
        subcategories: ['Tai nghe', 'Loa', 'Micro'],
      },
      {
        name: 'Hình ảnh',
        slug: 'hinh-anh',
        icon: 'Camera',
        description: 'Thiết bị hình ảnh chuyên nghiệp',
        status: CategoryStatus.ACTIVE,
        sortOrder: 2,
        subcategories: ['Camera', 'Máy ảnh', 'Ống kính'],
      },
      {
        name: 'Thời trang công nghệ',
        slug: 'thoi-trang-cong-nghe',
        icon: 'Watch',
        description: 'Phụ kiện công nghệ thông minh',
        status: CategoryStatus.ACTIVE,
        sortOrder: 3,
        subcategories: ['Đồng hồ thông minh', 'Vòng đeo tay', 'Kính thông minh'],
      },
    ];

    const categories: Category[] = [];
    for (const catData of categoryData) {
      const { subcategories, ...categoryFields } = catData;
      const category = em.create(Category, categoryFields);
      categories.push(category);
    }

    await em.flush();

    // Seed subcategories as separate records
    const subcategoryMappings = [
      { parentIndex: 0, names: ['Tai nghe', 'Loa', 'Micro'] },
      { parentIndex: 1, names: ['Camera', 'Máy ảnh', 'Ống kính'] },
      { parentIndex: 2, names: ['Đồng hồ thông minh', 'Vòng đeo tay', 'Kính thông minh'] },
    ];

    for (const mapping of subcategoryMappings) {
      const parentCategory = categories[mapping.parentIndex];
      for (const subName of mapping.names) {
        const slug = subName.toLowerCase().replace(/\s+/g, '-').normalize('NFD').replace(/[\u0300-\u036f]/g, '');
        em.create(Category, {
          name: subName,
          slug: `${parentCategory.slug}-${slug}`,
          parent: parentCategory,
          status: CategoryStatus.ACTIVE,
          sortOrder: 0,
        });
      }
    }

    // Seed stores
    const stores = [
      {
        name: 'Chi nhánh Quận 1 - TP.HCM',
        address: '123 Nguyễn Huệ, Phường Bến Nghé, Quận 1, TP. Hồ Chí Minh',
        phone: '028 1234 5678',
        email: 'quan1@store.vn',
        lat: 10.7769,
        lng: 106.7009,
        workingHours: {
          weekdays: { start: '08:00', end: '21:00' },
          weekends: { start: '09:00', end: '20:00' },
        },
        services: [
          'Trải nghiệm sản phẩm trực tiếp',
          'Tư vấn chuyên sâu từ chuyên gia',
          'Hỗ trợ cài đặt và kích hoạt',
          'Bảo hành và sửa chữa nhanh',
          'Đổi trả trong 7 ngày',
          'Miễn phí gửi xe ô tô, xe máy',
        ],
        allowPickup: true,
        preparationTime: '1-2 ngày làm việc',
        status: StoreStatus.ACTIVE,
      },
      {
        name: 'Chi nhánh Quận 3 - TP.HCM',
        address: '456 Võ Văn Tần, Phường 5, Quận 3, TP. Hồ Chí Minh',
        phone: '028 8765 4321',
        email: 'quan3@store.vn',
        lat: 10.7829,
        lng: 106.6919,
        workingHours: {
          weekdays: { start: '08:00', end: '21:00' },
          weekends: { start: '09:00', end: '20:00' },
        },
        services: [
          'Trải nghiệm sản phẩm trực tiếp',
          'Tư vấn chuyên sâu từ chuyên gia',
          'Đổi trả trong 7 ngày',
        ],
        allowPickup: true,
        preparationTime: '1-2 ngày làm việc',
        status: StoreStatus.ACTIVE,
      },
    ];

    for (const storeData of stores) {
      em.create(Store, storeData);
    }

    await em.flush();
  }
}

