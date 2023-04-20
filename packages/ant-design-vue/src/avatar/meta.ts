import type { IPublicTypeComponentMetadata } from '@alilc/lowcode-types';
import avatarImage from './__screenshots__/avatar-1.jpg?inline';

const meta: IPublicTypeComponentMetadata = {
  group: 'Antd',
  componentName: 'AAvatar',
  title: '头像',
  category: '数据展示',
  configure: {
    supports: {
      style: true,
      events: [
        {
          name: 'loadError',
          description: '图片加载失败的事件',
        },
      ],
    },
    props: [
      {
        name: 'src',
        title: { label: '图片地址', tip: '图片类头像的资源地址' },
        setter: 'StringSetter',
      },
      {
        name: 'alt',
        title: {
          label: '替代文本',
          tip: '图像无法显示时的替代文本',
        },
        setter: 'StringSetter',
      },
      {
        name: 'src',
        title: { label: '允许拖动', tip: '图片是否允许拖动' },
        setter: 'BoolSetter',
      },
      {
        name: 'gap',
        title: {
          label: '文字边距',
          tip: '字符类型距离左右两侧边界单位像素',
        },
        setter: 'NumberSetter',
        defaultValue: 4,
      },
      {
        name: 'shape',
        title: { label: '头像形状', tip: '指定头像的形状' },
        setter: {
          componentName: 'RadioGroupSetter',
          props: {
            options: [
              { label: '原型', value: 'circle' },
              { label: '方形', value: 'square' },
            ],
          },
        },
        defaultValue: 'circle',
      },
      {
        name: 'size',
        title: { label: '尺寸', tip: '设置头像的大小' },
        setter: {
          componentName: 'MixedSetter',
          props: {
            setters: [
              {
                componentName: 'RadioGroupSetter',
                props: {
                  options: [
                    { label: '默认', value: 'default' },
                    { label: '大号', value: 'large' },
                    { label: '小号', value: 'small' },
                  ],
                },
              },
              'NumberSetter',
            ],
          },
        },
        defaultValue: 'default',
      },
    ],
  },
  snippets: [
    {
      title: '头像',
      screenshot: avatarImage,
      schema: {
        componentName: 'AAvatar',
        props: {
          src: 'https://zos.alipayobjects.com/rmsportal/ODTLcjxAfvqbxHnVXCYX.png',
        },
      },
    },
  ],
};

export default meta;
