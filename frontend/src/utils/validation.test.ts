import { validateName, validateStudentId, validateEmail, validatePhone } from './validation';

describe('Validation Utilities', () => {
  describe('validateName', () => {
    it('should return null for names with at least 2 words', () => {
      expect(validateName('Nguyễn Văn A')).toBeNull();
      expect(validateName(' John Doe ')).toBeNull();
    });

    it('should return error message for names with less than 2 words', () => {
      expect(validateName('Nguyễn')).toBe('Họ và tên phải có ít nhất 2 chữ');
      expect(validateName(' ')).toBe('Họ và tên phải có ít nhất 2 chữ');
    });
  });

  describe('validateStudentId', () => {
    it('should return null for exactly 8 digits', () => {
      expect(validateStudentId('12345678')).toBeNull();
      expect(validateStudentId('21100000')).toBeNull();
    });

    it('should return error for non-8 digits', () => {
      expect(validateStudentId('1234567')).toBe('Mã số sinh viên phải có đúng 8 chữ số');
      expect(validateStudentId('123456789')).toBe('Mã số sinh viên phải có đúng 8 chữ số');
      expect(validateStudentId('abcdefgh')).toBe('Mã số sinh viên phải có đúng 8 chữ số');
    });
  });

  describe('validateEmail', () => {
    it('should return null for emails containing @', () => {
      expect(validateEmail('test@example.com')).toBeNull();
      expect(validateEmail('a@b')).toBeNull();
    });

    it('should return error for emails without @', () => {
      expect(validateEmail('testexample.com')).toBe('Email phải chứa ký tự @');
      expect(validateEmail('test')).toBe('Email phải chứa ký tự @');
    });
  });

  describe('validatePhone', () => {
    it('should return null for exactly 10 digits', () => {
      expect(validatePhone('0912345678')).toBeNull();
    });

    it('should return error for empty or non-10 digits', () => {
      expect(validatePhone('')).toBe('Số điện thoại không được để trống');
      expect(validatePhone('123456789')).toBe('Số điện thoại phải có đúng 10 chữ số');
      expect(validatePhone('09123456789')).toBe('Số điện thoại phải có đúng 10 chữ số');
      expect(validatePhone('abcdefghij')).toBe('Số điện thoại phải có đúng 10 chữ số');
    });
  });
});
