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
      url: 'https://argo-workflows.blvhn.online/api/v1/events/test/create-repo-template',
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
