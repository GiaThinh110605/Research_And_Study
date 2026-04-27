import { TestOut } from '../services/test';

export const mockTestDetail: TestOut = {
  id: 1,
  title: 'Kiểm tra giữa kỳ - Logic học',
  subject: 'TRẮC NGHIỆM',
  created_at: '2023-10-15T08:00:00Z',
  questions_count: 5,
  duration_minutes: 45,
  status: 'ĐANG LÀM',
  questions: [
    {
      id: 101,
      text: 'Mệnh đề là gì?',
      options: [
        'Một câu nói có thể đúng hoặc sai, nhưng không thể vừa đúng vừa sai.',
        'Một câu hỏi nghi vấn.',
        'Một câu cảm thán.',
        'Một biểu thức toán học không có dấu bằng.'
      ],
      answer: 0
    },
    {
      id: 102,
      text: 'Phủ định của mệnh đề "Mọi số nguyên tố đều lẻ" là:',
      options: [
        'Không có số nguyên tố nào lẻ.',
        'Có một số lượng vô hạn các số nguyên tố chẵn.',
        'Tồn tại ít nhất một số nguyên tố chẵn.',
        'Mọi số nguyên tố đều chẵn.'
      ],
      answer: 2
    },
    {
      id: 103,
      text: 'Luật đối ngẫu De Morgan phát biểu rằng phủ định của (A hội B) tương đương với:',
      options: [
        'Phủ định A hội Phủ định B',
        'Phủ định A tuyển Phủ định B',
        'A hội B',
        'Cả 3 mệnh đề trên đều sai'
      ],
      answer: 1
    },
    {
      id: 104,
      text: 'Trong logic mệnh đề, biểu thức P -> Q sai khi nào?',
      options: [
        'P đúng, Q sai',
        'P sai, Q đúng',
        'P đúng, Q đúng',
        'P sai, Q sai'
      ],
      answer: 0
    },
    {
      id: 105,
      text: 'Tập hợp A giao tập hợp B là tập hợp chứa các phần tử:',
      options: [
        'Thuộc A hoặc thuộc B',
        'Thuộc A nhưng không thuộc B',
        'Không thuộc cả A và B',
        'Vừa thuộc A vừa thuộc B'
      ],
      answer: 3
    }
  ]
};
