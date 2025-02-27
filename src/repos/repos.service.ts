import { Injectable } from '@nestjs/common';
import { CreateRepoDto } from './dto/create-repo.dto';
import { UpdateRepoDto } from './dto/update-repo.dto';
import { Repo } from './entities/repo.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { HttpService } from '@nestjs/axios';
import { Project } from 'src/projects/entities/project.entity';

@Injectable()
export class ReposService {
  constructor(
    @InjectRepository(Repo)
    private repo: Repository<Repo>,
    @InjectRepository(Project)
    private projRepo: Repository<Project>,
    private readonly httpService: HttpService,
  ) {}

  async create(createRepoDto: CreateRepoDto) {
    const { name, url } = createRepoDto;
    const project = await this.projRepo.findOneBy({
      id: createRepoDto.projectId,
    });

    const result = await this.repo.save({
      ...createRepoDto,
      helmLink: `git@github.com:hari1602/${name}.git`,
      url: url ?? `${name}.${project.domain}`,
    });

    await this.argo({
      repo_name: result.name,
      repo_link: result.repoLink,
      repo_desc: 'sample',
      repo_domain: result.url,
      repo_port: result.port,
      dockerfile_name: result.dockerfileName,
      dockerfile_location: result.dockerfileLocation,
      repo_branch: result.repoBranch,
      main_domain: result.mainDomain,
    });
    return result;
  }

  findAll() {
    return `This action returns all repos`;
  }

  findOne(id: string) {
    return this.repo.findOne({ where: { id }, relations: { project: true } });
  }

  async update(id: string, updateRepoDto: UpdateRepoDto) {
    let repo = await this.repo.findOneBy({ id });
    repo = { ...repo, ...updateRepoDto };
    return this.repo.save(repo);
  }

  remove(id: number) {
    return `This action removes a #${id} repo`;
  }

  async argo(input: {
    repo_name: string;
    repo_desc: string;
    repo_link: string;
    repo_domain: string;
    repo_port: string;
    main_domain: boolean;
    dockerfile_name: string;
    dockerfile_location: string;
    repo_branch: string;
  }) {
    await this.httpService.axiosRef({
      url: 'https://argo-workflows.blvhn.online/api/v1/events/multex/create-repo-template',
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
