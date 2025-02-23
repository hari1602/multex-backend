import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateClientDto } from './dto/create-client.dto';
import { UpdateClientDto } from './dto/update-client.dto';
import { Client } from './entities/client.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class ClientsService {
  constructor(
    @InjectRepository(Client)
    private repo: Repository<Client>,
  ) {}

  create(createClientDto: CreateClientDto) {
    return this.repo.save(createClientDto);
  }

  findAll() {
    return this.repo.find({ relations: { projects: true } });
  }

  findOne(id: string) {
    return this.repo.findOne({ where: { id }, relations: { projects: true } });
  }

  async findOneByEmail(email: string) {
    const result = await this.repo.findOneBy({ email });
    if (!result) return new NotFoundException();
    return result;
  }

  async update(id: string, updateClientDto: UpdateClientDto) {
    let client = await this.repo.findOneBy({ id });
    client = { ...client, ...updateClientDto };
    return this.repo.save(client);
  }

  remove(id: number) {
    return `This action removes a #${id} client`;
  }
}
