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
      url: 'https://argo-workflows.blvhn.online/api/v1/events/multex/add-domain-template',
      method: `POST`,
      headers: {
        'X-Argo-E2E': true,
        Authorization:
          'Bearer eyJhbGciOiJSUzI1NiIsImtpZCI6InRNc21CS2VkRTNfNEpIWnBXSnRkbEJFQlNYb01Cc1FqY0pMZ3hSSS1vdTgifQ.eyJpc3MiOiJrdWJlcm5ldGVzL3NlcnZpY2VhY2NvdW50Iiwia3ViZXJuZXRlcy5pby9zZXJ2aWNlYWNjb3VudC9uYW1lc3BhY2UiOiJtdWx0ZXgiLCJrdWJlcm5ldGVzLmlvL3NlcnZpY2VhY2NvdW50L3NlY3JldC5uYW1lIjoiamVua2lucy5zZXJ2aWNlLWFjY291bnQtdG9rZW4iLCJrdWJlcm5ldGVzLmlvL3NlcnZpY2VhY2NvdW50L3NlcnZpY2UtYWNjb3VudC5uYW1lIjoiamVua2lucyIsImt1YmVybmV0ZXMuaW8vc2VydmljZWFjY291bnQvc2VydmljZS1hY2NvdW50LnVpZCI6ImI2Y2VmODMwLWE3NTgtNDZmYi1hYmJhLTFkYmRiM2MyZjA3MCIsInN1YiI6InN5c3RlbTpzZXJ2aWNlYWNjb3VudDptdWx0ZXg6amVua2lucyJ9.ttdSzfuiVuhF9mxlfSKlR2NMavGgtZNJ628EqpXo_5_mv7vNyLZfNG1BdDjDDUI7q0cutnStpF-7Z0z6UDjPfFZLQTQ3-E0QdVpCYqkmrp5inwRT_gk2s-LJOFs-GFFcvHGEPGZbBQ2A6yAz3l6uxQEPZaNHEi9-p1i7F5qVYDNj7Rnya8De9BYXIewl6P3SLHy8jal_4x5Go1hqb7IdUs-Mle4KIG4u9h7y9A7h5FWFwnwi2g2r0YdT2jKIIV6UQ9NJ2C15UBdg5VHTabRH3vMcuqE05Jz3qnb_gynZwQvx5TEzdKR3VTeKGpk8QAi1o8urf_1Q-clCo6j6bzHuWw',
      },
      data: input,
    });

    return true;
  }
}
