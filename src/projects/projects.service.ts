import { Injectable } from '@nestjs/common';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { Project } from './entities/project.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { HttpService } from '@nestjs/axios';

@Injectable()
export class ProjectsService {
  constructor(
    @InjectRepository(Project)
    private repo: Repository<Project>,
    private readonly httpService: HttpService,
  ) {}

  async create(createProjectDto: CreateProjectDto) {
    const result = await this.repo.save({
      ...createProjectDto,
      domain: createProjectDto.customDomain
        ? createProjectDto.domain
        : `${createProjectDto.name}.blvhn.online`,
    });
    await this.argo();
    return result;
  }

  findAll() {
    return this.repo.find();
  }

  findOne(id: string) {
    return this.repo.findOne({ where: { id }, relations: { repos: true } });
  }

  async update(id: string, updateProjectDto: UpdateProjectDto) {
    let proj = await this.repo.findOneBy({ id });
    proj = { ...proj, ...updateProjectDto };
    return this.repo.save(proj);
  }

  remove(id: number) {
    return `This action removes a #${id} project`;
  }

  async argo() {
    await this.httpService.axiosRef({
      url: 'https://localhost:2746/api/v1/events/argo/test-flow',
      method: `POST`,
      headers: { 'X-Argo-E2E': true },
      data: { message: 'hello events' },
    });

    return true;
  }
}
