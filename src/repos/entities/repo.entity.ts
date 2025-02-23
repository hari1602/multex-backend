import { Project } from 'src/projects/entities/project.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';

@Entity()
export class Repo {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column()
  mainDomain: boolean;

  @Column()
  url: string;

  @Column()
  repoLink: string;

  @Column()
  repoBranch: string;

  @Column({ nullable: true })
  helmLink: string;

  @ManyToOne(() => Project, (project) => project.repos, { cascade: true })
  @JoinColumn()
  project: Project;

  @Column()
  projectId: string;

  @Column()
  port: string;

  @Column()
  dockerfileName: string;

  @Column()
  dockerfileLocation: string;
}
