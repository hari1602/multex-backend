import { Project } from 'src/projects/entities/project.entity';
import {
  PrimaryGeneratedColumn,
  Column,
  JoinColumn,
  Entity,
  ManyToOne,
} from 'typeorm';

@Entity()
export class Tenant {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  // @Column({ unique: true })
  // email: string;

  @Column({ unique: true })
  domain: string;

  @ManyToOne(() => Project, (project) => project.tenants, { cascade: true })
  @JoinColumn()
  project: Project;

  @Column()
  projectId: string;
}
