// src/pages/reference/ReferenceCreatePage.tsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/contexts/useToast';
import KeywordInput from '@/components/reference/KeywordInput';
import FileUpload from '@/components/reference/FileUpload';

interface FileItem {
  id: string;
  type: 'link' | 'image' | 'pdf' | 'file';
  content: string;
}

interface FormData {
  collection: string;
  title: string;
  keywords: string[];
  memo: string;
  files: FileItem[];
}

export default function ReferenceCreatePage() {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [formData, setFormData] = useState<FormData>({
    collection: '',
    title: '',
    keywords: [],
    memo: '',
    files: [{
      id: Date.now().toString(),
      type: 'link',
      content: ''
    }]
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      // Validation
      if (!formData.collection) {
        showToast('컬렉션을 선택해 주세요.', 'error');
        return;
      }
      if (!formData.title) {
        showToast('제목을 입력해 주세요.', 'error');
        return;
      }
      if (formData.files.some(file => !file.content)) {
        showToast('모든 자료를 입력해 주세요.', 'error');
        return;
      }

      // API call would go here
      showToast('레퍼런스가 등록되었습니다.', 'success');
      navigate('/references');
    } catch {
      showToast('레퍼런스 등록에 실패했습니다.', 'error');
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-2">
            <h1 className="text-[#62BA9B] text-2xl font-semibold">레퍼런스 추가</h1>
            <span className="text-sm text-gray-500">* 필수 항목</span>
          </div>
          <button
            onClick={handleSubmit}
            className="px-6 py-2 bg-[#62BA9B] text-white rounded-full hover:bg-[#4a9177] transition-colors"
          >
            등록
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="flex gap-4 items-start">
            {/* Collection Selection */}
            <div className="w-[244px]">
              <label className="block mb-2">
                <span className="text-gray-700">
                  컬렉션 <span className="text-red-500">*</span>
                </span>
              </label>
              <select
                value={formData.collection}
                onChange={(e) => setFormData({ ...formData, collection: e.target.value })}
                className="w-full h-[56px] border border-gray-300 rounded-lg px-4"
              >
                <option value="">저장할 컬렉션을 선택하세요.</option>
                {/* Collection options would be mapped here */}
              </select>
            </div>

            {/* Title Input */}
            <div className="flex-1">
              <label className="block mb-2">
                <span className="text-gray-700">
                  제목 <span className="text-red-500">*</span>
                </span>
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                maxLength={20}
                placeholder="레퍼런스의 제목을 입력해 주세요."
                className="w-full h-[56px] border border-gray-300 rounded-lg px-4"
              />
              <div className="text-right text-sm text-gray-500 mt-1">
                {formData.title.length}/20
              </div>
            </div>
          </div>

          {/* Keywords Input */}
          <div>
            <label className="block mb-2">
              <span className="text-gray-700">키워드</span>
            </label>
            <div className="border border-gray-300 rounded-lg px-4 py-2 min-h-[56px]">
              <KeywordInput
                keywords={formData.keywords}
                onChange={(keywords) => setFormData({ ...formData, keywords })}
                maxKeywords={10}
                maxLength={15}
              />
            </div>
            <p className="text-sm text-gray-500 mt-1">띄어쓰기로 구분해서 입력해주세요.</p>
          </div>

          {/* Memo Input */}
          <div>
            <label className="block mb-2">
              <span className="text-gray-700">메모</span>
            </label>
            <textarea
              value={formData.memo}
              onChange={(e) => setFormData({ ...formData, memo: e.target.value })}
              maxLength={500}
              placeholder="내용을 입력해주세요."
              className="w-full h-32 border border-gray-300 rounded-lg px-4 py-2 resize-none"
            />
            <div className="text-right text-sm text-gray-500 mt-1">
              {formData.memo.length}/500
            </div>
          </div>

          {/* File Upload Section */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <label className="block">
                <span className="text-gray-700">
                  자료 첨부 <span className="text-red-500">*</span>
                </span>
              </label>
              <span className="text-sm text-gray-500">최대 5개까지 추가 가능합니다.</span>
            </div>
            <div className="border border-gray-300 rounded-lg p-4">
              <FileUpload
                files={formData.files}
                onChange={(files) => setFormData({ ...formData, files })}
                maxFiles={5}
              />
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}