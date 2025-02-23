import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateTenantDto } from './dto/create-tenant.dto';
import { UpdateTenantDto } from './dto/update-tenant.dto';
import { Tenant } from './entities/tenant.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { HttpService } from '@nestjs/axios';
import { Project } from 'src/projects/entities/project.entity';

@Injectable()
export class TenantsService {
  constructor(
    @InjectRepository(Tenant)
    private repo: Repository<Tenant>,
    @InjectRepository(Project)
    private projRepo: Repository<Project>,
    private readonly httpService: HttpService,
  ) {}

  async create(createTenantDto: CreateTenantDto) {
    const project = await this.projRepo.findOne({
      where: { id: createTenantDto.projectId },
      relations: { repos: true },
    });

    const result = await this.repo.save({
      ...createTenantDto,
      domain: `${createTenantDto.name}.${project.domain}`,
    });

    await this.argo({
      domain: result.domain,
      repo_link: project.repos.find((repo) => repo.mainDomain).helmLink,
    });
    return result;
  }

  findAll() {
    return this.repo.find();
  }

  async findOne(id: string) {
    const result = await this.repo.findOneBy({
      name: id,
    });

    if (!result) return new NotFoundException();

    return result;
  }

  async findByProj(id: string) {
    const result = await this.repo.findBy({
      projectId: id,
    });

    if (!result) return new NotFoundException();

    return result;
  }

  async update(id: string, updateTenantDto: UpdateTenantDto) {
    let tenant = await this.repo.findOneBy({ id });
    tenant = { ...tenant, ...updateTenantDto };
    return this.repo.save(tenant);
  }

  remove(id: number) {
    return `This action removes a #${id} tenant`;
  }

  async argo(input: { domain: string; repo_link: string }) {
    await this.httpService.axiosRef({
      url: 'https://argo-workflows.blvhn.online/api/v1/events/test/add-domain-template',
      method: `POST`,
      headers: {
        'X-Argo-E2E': true,
        Authorization:
          'Bearer eyJhbGciOiJSUzI1NiIsImtpZCI6ImpfaTFLaFNyLXZfR0FXb0FQNGppalZWLXRMSU1GOWpVcVZrUFY3c1R0VU0ifQ.eyJpc3MiOiJrdWJlcm5ldGVzL3NlcnZpY2VhY2NvdW50Iiwia3ViZXJuZXRlcy5pby9zZXJ2aWNlYWNjb3VudC9uYW1lc3BhY2UiOiJ0ZXN0Iiwia3ViZXJuZXRlcy5pby9zZXJ2aWNlYWNjb3VudC9zZWNyZXQubmFtZSI6ImplbmtpbnMuc2VydmljZS1hY2NvdW50LXRva2VuIiwia3ViZXJuZXRlcy5pby9zZXJ2aWNlYWNjb3VudC9zZXJ2aWNlLWFjY291bnQubmFtZSI6ImplbmtpbnMiLCJrdWJlcm5ldGVzLmlvL3NlcnZpY2VhY2NvdW50L3NlcnZpY2UtYWNjb3VudC51aWQiOiI0ZTY0NmQzMS04ZTRlLTQ5ODQtYWJlOS1iY2FjZjY5NWYxMzYiLCJzdWIiOiJzeXN0ZW06c2VydmljZWFjY291bnQ6dGVzdDpqZW5raW5zIn0.eE5nYOVUFdOK4K-H7v7LE76HDrWDIdzWrXlXt6s4q86_5IvIEXGA5B-R4yN2qk6RfI36xVSuPCcNIUJSfVOODVoxajINy0jLjbnca67K1jdj2Z0zU0Lzt-9xf9zJgPRwdjDhPDkNmH9XUCYjIl_49dXlp2YdzPJCuM-RxaMu88gtsCJJoNiypyRHSS8-IambKdntVXPjyZUWR2JvtZCf17BajiNSFQrMiV2SQO2MfeeKU7qUrRM2qBSqyW5uxSHDJ5SLv1hG6loRADhEMX6zTaYC2UomcnUSGgqGvukqhqWPY82qpp6H_CkV_RNATgbbp8tlQ_JNrsp889nOqDi12w',
      },
      data: input,
    });

    return true;
  }
}
