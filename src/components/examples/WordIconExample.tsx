import React from 'react';
import {
  BereshitIconColorful,
  ElohimIconColorful,
  BaraIconColorful,
  NachashIconColorful,
  getColorfulIconForWord
} from '../icons';

/**
 * 화려한 히브리어 단어 아이콘 사용 예시
 */
export default function WordIconExample() {
  const words = [
    { hebrew: 'בְּרֵאשִׁית', meaning: '처음, 태초', Icon: BereshitIconColorful },
    { hebrew: 'אֱלֹהִים', meaning: '하나님', Icon: ElohimIconColorful },
    { hebrew: 'בָּרָא', meaning: '창조하다', Icon: BaraIconColorful },
    { hebrew: 'נָחָשׁ', meaning: '뱀', Icon: NachashIconColorful },
  ];

  return (
    <div className="p-8 bg-gradient-to-br from-indigo-50 to-purple-50 min-h-screen">
      <h1 className="text-4xl font-bold text-center mb-8 text-gray-800">
        🎨 화려한 히브리어 단어 아이콘
      </h1>

      {/* 아이콘 그리드 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        {words.map(({ hebrew, meaning, Icon }) => (
          <div
            key={hebrew}
            className="bg-white rounded-2xl shadow-xl p-6 flex flex-col items-center gap-4 hover:scale-105 transition-transform"
          >
            <Icon size={128} />
            <div className="text-center">
              <div
                className="text-3xl font-bold mb-2"
                dir="rtl"
                style={{ fontFamily: 'David, serif' }}
              >
                {hebrew}
              </div>
              <div className="text-lg text-gray-600">{meaning}</div>
            </div>
          </div>
        ))}
      </div>

      {/* 동적 아이콘 로딩 예시 */}
      <div className="bg-white rounded-2xl shadow-xl p-8">
        <h2 className="text-2xl font-bold mb-6 text-gray-800">
          📋 동적 아이콘 로딩 예시
        </h2>

        <div className="space-y-4">
          {words.map(({ hebrew, meaning }) => {
            const IconComponent = getColorfulIconForWord(hebrew);

            return (
              <div
                key={hebrew}
                className="flex items-center gap-4 p-4 bg-gradient-to-r from-purple-50 to-indigo-50 rounded-xl"
              >
                {IconComponent ? (
                  <IconComponent size={64} />
                ) : (
                  <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center text-3xl">
                    📜
                  </div>
                )}

                <div>
                  <div
                    className="text-2xl font-bold mb-1"
                    dir="rtl"
                    style={{ fontFamily: 'David, serif' }}
                  >
                    {hebrew}
                  </div>
                  <div className="text-gray-600">{meaning}</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 크기 변형 예시 */}
      <div className="mt-12 bg-white rounded-2xl shadow-xl p-8">
        <h2 className="text-2xl font-bold mb-6 text-gray-800">
          📐 다양한 크기
        </h2>

        <div className="flex items-end justify-center gap-8">
          <div className="text-center">
            <BereshitIconColorful size={32} />
            <div className="mt-2 text-sm text-gray-600">32px</div>
          </div>
          <div className="text-center">
            <BereshitIconColorful size={48} />
            <div className="mt-2 text-sm text-gray-600">48px</div>
          </div>
          <div className="text-center">
            <BereshitIconColorful size={64} />
            <div className="mt-2 text-sm text-gray-600">64px</div>
          </div>
          <div className="text-center">
            <BereshitIconColorful size={96} />
            <div className="mt-2 text-sm text-gray-600">96px</div>
          </div>
          <div className="text-center">
            <BereshitIconColorful size={128} />
            <div className="mt-2 text-sm text-gray-600">128px</div>
          </div>
        </div>
      </div>

      {/* 플래시카드 스타일 예시 */}
      <div className="mt-12 bg-white rounded-2xl shadow-xl p-8">
        <h2 className="text-2xl font-bold mb-6 text-gray-800">
          🃏 플래시카드 스타일
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-purple-500 to-indigo-600 p-8 text-white shadow-2xl">
            <div className="flex flex-col items-center gap-4">
              <ElohimIconColorful size={128} />
              <div
                className="text-5xl font-bold"
                dir="rtl"
                style={{ fontFamily: 'David, serif' }}
              >
                אֱלֹהִים
              </div>
              <div className="text-2xl">엘로힘</div>
              <div className="text-lg opacity-90">하나님</div>
            </div>
          </div>

          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-green-500 to-teal-600 p-8 text-white shadow-2xl">
            <div className="flex flex-col items-center gap-4">
              <NachashIconColorful size={128} />
              <div
                className="text-5xl font-bold"
                dir="rtl"
                style={{ fontFamily: 'David, serif' }}
              >
                נָחָשׁ
              </div>
              <div className="text-2xl">나하쉬</div>
              <div className="text-lg opacity-90">뱀</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
