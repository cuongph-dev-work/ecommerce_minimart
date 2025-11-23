import { IsEnum, IsString, IsNotEmpty } from 'class-validator';
import { ContactType } from '../../../entities/contact-history.entity';

export class AddContactDto {
  @IsEnum(ContactType)
  type!: ContactType;

  @IsString()
  @IsNotEmpty()
  note!: string;
}

