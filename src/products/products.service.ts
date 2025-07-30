import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Product } from './entities/product.entity';
import { ILike, Like, Repository } from 'typeorm';
import { ProductCategory } from 'src/categories/entities/productCategory.entity';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product) private productRepository: Repository<Product>,
    @InjectRepository(ProductCategory)
    private prodCatRepository: Repository<ProductCategory>,
  ) {}

  async create(createProductDto: CreateProductDto) {
    const product = await this.productRepository.save(createProductDto);
    const { categoryIds } = createProductDto;

    if (categoryIds) {
      if (categoryIds?.length < 1) {
        throw new BadRequestException(
          'product should belong to at least one category',
        );
      }

      const existingCombinations = await this.prodCatRepository.find({
        where: categoryIds.map((catId) => ({
          productId: product.productId,
          categoryId: catId,
        })),
      });

      if (existingCombinations.length > 0) {
        throw new UnprocessableEntityException(
          'One or more product-category combinations already exist',
        );
      }

      const objectToSend = categoryIds.map((catId) => ({
        productId: product.productId,
        catId,
      }));
      const productCategories = objectToSend.map((data) => {
        const productCategory = new ProductCategory();
        productCategory.productId = data.productId;
        productCategory.categoryId = data.catId;
        return productCategory;
      });
      await this.prodCatRepository.save(productCategories);
    }
  }

  async findAll(page: number = 1, limit: number = 10, q = '') {
    const skip = (page - 1) * limit;

    const [productsWithCategories, total] =
      await this.prodCatRepository.findAndCount({
        relations: {
          category: true,
          product: true,
        },
        select: {
          product: {
            productId: true,
            image_url: true,
            name: true,
            price: true,
          },
          category: {
            categoryId: true,
            image_url: true,
            name: true,
          },
        },
        where: [
          {
            category: {
              name: ILike(`%${q}%`),
            },
          },
          {
            product: {
              name: ILike(`%${q}%`),
            },
          },
        ],
        skip,
        take: limit,
      });

    const CategoriesMap = new Map();

    productsWithCategories.forEach((pc) => {
      const categoryId = pc.category.categoryId;

      if (!CategoriesMap.has(categoryId)) {
        CategoriesMap.set(categoryId, {
          ...pc.category,
          product: [],
        });
      }

      CategoriesMap.get(categoryId).product.push(pc.product);
    });

    return {
      data: Array.from(CategoriesMap.values()),
      total,
      page,
      limit,
    };
  }

  async search(
    page: number,
    limit: number,
    q?: string,
    minPrice?: number,
    maxPrice?: number,
  ) {
    const pageNum = Number(page) || 1;
    const limitNum = Number(limit) || 10;
    const skip = (pageNum - 1) * limitNum;

    let query = this.productRepository
      .createQueryBuilder('product')
      .skip(skip)
      .take(limitNum);

    if (q) {
      query = query.andWhere('product.name ILIKE :q', { q: `%${q}%` });
    }
    if (minPrice !== undefined) {
      query = query.andWhere('product.price >= :minPrice', { minPrice });
    }
    if (maxPrice !== undefined) {
      query = query.andWhere('product.price <= :maxPrice', { maxPrice });
    }

    return query.getMany();
  }
  // async searchByCategoryName(
  //   page: number = 1,
  //   limit: number = 10,
  //   categoryName: string,
  //   q?: string,
  // ) {
  //   const skip = (page - 1) * limit;

  //   let query = this.productRepository
  //     .createQueryBuilder('product')
  //     .leftJoin('product.products', 'productCategory')
  //     .leftJoin('productCategory.category', 'category')
  //     .where('category.name = :categoryName', { categoryName })
  //     .skip(skip)
  //     .take(limit);

  //   if (q) {
  //     query = query.andWhere('product.name ILIKE :q', { q: `%${q}%` });
  //   }

  //   return query.getMany();
  // }
  findOne(id: string) {
    return this.productRepository.findOne({
      where: {
        productId: id,
      },
    });
  }

  update(id: string, updateProductDto: UpdateProductDto) {
    return this.productRepository.update(id, {
      ...updateProductDto,
    });
  }

  remove(id: string) {
    this.productRepository.softDelete({
      productId: id,
    });
    this.prodCatRepository.softDelete({
      productId: id,
    });
  }
}
