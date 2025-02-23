import { Client } from 'src/clients/entities/client.entity';
import { Repo } from 'src/repos/entities/repo.entity';
import { Tenant } from 'src/tenants/entities/tenant.entity';
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';

@Entity()
export class Project {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ unique: true, nullable: true })
  domain: string;

  @Column()
  customDomain: boolean;

  @OneToMany(() => Tenant, (tenant) => tenant.project)
  tenants: Tenant[];

  @ManyToOne(() => Client, (client) => client.projects, { cascade: true })
  @JoinColumn()
  client: Client;

  @Column()
  clientId: string;

  @OneToMany(() => Repo, (repo) => repo.project)
  repos: Repo[];
}
