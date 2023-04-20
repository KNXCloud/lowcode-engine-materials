import type { IPublicTypeComponentMetadata } from '@alilc/lowcode-types';
import cardImage from './__screenshots__/card-1.png?inline';

const meta: IPublicTypeComponentMetadata = {
  group: 'Antd',
  componentName: 'ACard',
  title: '卡片',
  category: '数据展示',
  configure: {
    component: {
      isContainer: true,
    },
    supports: {
      style: true,
      events: [
        {
          name: 'onTabChange',
          description: '页签切换的回调',
        },
      ],
    },
    props: [
      {
        name: 'title',
        title: { label: '卡片标题', tip: '卡片标题' },
        setter: {
          componentName: 'MixedSetter',
          props: {
            setters: ['StringSetter', 'SlotSetter'],
          },
        },
      },
      {
        name: 'bordered',
        title: { label: '显示边框', tip: '是否有边框' },
        setter: 'BoolSetter',
        defaultValue: true,
      },
      {
        name: 'cover',
        title: { label: '卡片封面', tip: '卡片封面' },
        setter: 'SlotSetter',
      },
      {
        name: 'extra',
        title: { label: '额外元素', tip: '卡片右上角的操作区域' },
        setter: {
          componentName: 'MixedSetter',
          props: {
            setters: ['StringSetter', 'SlotSetter'],
          },
        },
      },
      {
        name: 'hoverable',
        title: { label: '可浮起', tip: '鼠标移过时可浮起' },
        setter: 'BoolSetter',
        defaultValue: false,
      },
      {
        name: 'loading',
        title: {
          label: 'loading',
          tip: '当卡片内容还在加载中时，可以用 loading 展示一个占位',
        },
        setter: 'BoolSetter',
        defaultValue: false,
      },
      {
        name: 'size',
        title: { label: '尺寸', tip: 'card 的尺寸' },
        setter: {
          componentName: 'RadioGroupSetter',
          props: {
            options: [
              { label: '默认', value: 'default' },
              { label: '小', value: 'small' },
            ],
          },
        },
        defaultValue: 'default',
      },
    ],
  },
  snippets: [
    {
      title: '卡片',
      screenshot: cardImage,
      schema: {
        componentName: 'ACard',
        props: {
          title: 'Default size card',
        },
      },
    },
  ],
};

export default meta;
