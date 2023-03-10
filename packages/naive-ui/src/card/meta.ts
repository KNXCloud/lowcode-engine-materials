import type { IPublicTypeComponentMetadata } from '@alilc/lowcode-types';
import cardImage from './__screenshots__/card-1.png?inline';

const meta: IPublicTypeComponentMetadata = {
  componentName: 'NCard',
  title: '卡片',
  category: '数据展示',
  configure: {
    supports: {
      style: true,
      events: ['onClose'],
      loop: false,
    },
    component: {
      isContainer: true,
    },
    props: [
      {
        type: 'group',
        title: '基础设置',
        extraProps: {
          display: 'block',
        },
        items: [
          {
            name: 'size',
            title: '卡片尺寸',
            setter: {
              componentName: 'RadioGroupSetter',
              props: {
                options: [
                  { label: 'small', value: 'small' },
                  { label: 'medium', value: 'medium' },
                  { label: 'large', value: 'large' },
                  { label: 'huge', value: 'huge' },
                ],
                defaultValue: 'medium',
              },
            },
          },
          {
            name: 'bordered',
            title: '显示边框',
            setter: 'BoolSetter',
          },
          {
            name: 'closable',
            title: '显示关闭图标',
            setter: 'BoolSetter',
          },
          {
            name: 'hoverable',
            title: '可悬浮',
            setter: 'BoolSetter',
          },
        ],
      },
      {
        type: 'group',
        title: '卡片样式',
        extraProps: {
          display: 'block',
        },
        items: [
          {
            name: 'content-style',
            extraProps: {
              display: 'popup',
            },
            title: { label: '内容样式', tip: '卡片内容区域的样式' },
            setter: 'StyleSetter',
          },
          {
            name: 'footer-style',
            extraProps: {
              display: 'popup',
            },
            title: { label: '底部样式', tip: '卡片底部区域的样式' },
            setter: 'StyleSetter',
          },
          {
            name: 'header-style',
            extraProps: {
              display: 'popup',
            },
            title: { label: '头部样式', tip: '卡片头部区域的样式' },
            setter: 'StyleSetter',
          },
          {
            name: 'header-extra-style',
            extraProps: {
              display: 'popup',
            },
            title: { label: '头部额外内容样式', tip: '卡片头部额外内容的样式' },
            setter: 'StyleSetter',
          },
        ],
      },
      {
        type: 'group',
        title: '分割线',
        extraProps: {
          display: 'block',
        },
        items: [
          {
            name: 'segmented.content',
            title: '内容分割线',
            setter: {
              componentName: 'BoolSetter',
              initialValue: false,
            },
          },
          {
            name: 'segmented.footer',
            title: '底部分割线',
            setter: {
              componentName: 'BoolSetter',
              initialValue: false,
            },
          },
          {
            name: 'segmented.action',
            title: '操作区分割线',
            setter: {
              componentName: 'BoolSetter',
              initialValue: false,
            },
          },
        ],
      },
      {
        title: '卡片内容',
        type: 'group',
        extraProps: {
          display: 'block',
        },
        items: [
          {
            name: 'title',
            title: '标题内容',
            setter: 'StringSetter',
          },
          {
            name: 'header',
            title: '头部',
            setter: {
              componentName: 'SlotSetter',
              initialValue: {
                type: 'JSSlot',
                title: '头部',
                value: [],
              },
            },
          },
          {
            name: 'header-extra',
            title: '头部附加',
            setter: {
              componentName: 'SlotSetter',
              initialValue: {
                type: 'JSSlot',
                title: '头部附加',
                value: [],
              },
            },
          },
          {
            name: 'footer',
            title: '底部',
            setter: {
              componentName: 'SlotSetter',
              initialValue: {
                type: 'JSSlot',
                title: '底部',
                value: [],
              },
            },
          },
          {
            name: 'action',
            title: '操作区',
            setter: {
              componentName: 'SlotSetter',
              initialValue: {
                type: 'JSSlot',
                title: '操作区',
                value: [],
              },
            },
          },
        ],
      },
    ],
  },
  snippets: [
    {
      title: '卡片',
      screenshot: cardImage,
      schema: {
        componentName: 'NCard',
        props: {
          title: 'Default size card',
        },
      },
    },
  ],
};

export default meta;
