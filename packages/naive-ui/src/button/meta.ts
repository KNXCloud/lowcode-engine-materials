import type { IPublicTypeComponentMetadata } from '@alilc/lowcode-types';
import primaryButtonImage from './__screenshots__/button-1.png?inline';

const meta: IPublicTypeComponentMetadata = {
  componentName: 'NButton',
  title: '按钮',
  category: '通用',
  configure: {
    props: [
      {
        name: 'disabled',
        title: { label: '禁用按钮', tip: '按钮是否禁用' },
        setter: 'BoolSetter',
        defaultValue: false,
      },
    ],
    supports: {
      style: true,
      events: ['onClick'],
    },
  },
  snippets: [
    {
      title: '主按钮',
      screenshot: primaryButtonImage,
      schema: {
        componentName: 'NButton',
        props: {
          type: 'primary',
          children: '按钮',
        },
      },
    },
  ],
};

export default meta;
