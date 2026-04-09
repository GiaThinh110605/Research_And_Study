export const validateName = (name: string): string | null => {
  const normalized = name.trim();
  if (normalized.split(/\s+/).length < 2) {
    return 'Họ và tên phải có ít nhất 2 chữ';
  }
  return null;
};

export const validateStudentId = (studentId: string): string | null => {
  if (!/^\d{8}$/.test(studentId)) {
    return 'Mã số sinh viên phải có đúng 8 chữ số';
  }
  return null;
};

export const validateEmail = (email: string): string | null => {
  if (!email.includes('@')) {
    return 'Email phải chứa ký tự @';
  }
  return null;
};

export const validatePhone = (phone: string): string | null => {
  if (!phone) {
    return 'Số điện thoại không được để trống';
  }
  if (!/^\d{10}$/.test(phone)) {
    return 'Số điện thoại phải có đúng 10 chữ số';
  }
  return null;
};
