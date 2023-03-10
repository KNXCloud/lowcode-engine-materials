import type { IPublicTypeComponentMetadata } from '@alilc/lowcode-types';
import avatarImage from './__screenshots__/avatar-1.jpg?inline';

const meta: IPublicTypeComponentMetadata = {
  componentName: 'NAvatar',
  title: '头像',
  category: '数据展示',
  configure: {
    props: [
      {
        name: 'src',
        title: '头像的地址',
        setter: 'StringSetter',
      },
      {
        name: 'fallback-src',
        title: {
          label: '加载失败地址',
          tip: '头像加载失败时显示的图片的地址',
        },
        setter: 'StringSetter',
      },
      {
        name: 'color',
        title: '头像的背景色',
        setter: 'ColorSetter',
      },
      {
        name: 'circle',
        title: '是否为圆形',
        setter: 'BoolSetter',
      },
      {
        name: 'round',
        title: '是否显示圆角',
        setter: 'BoolSetter',
      },
      {
        name: 'bordered',
        title: '是否带边框',
        setter: 'BoolSetter',
      },
      {
        name: 'size',
        title: '头像大小',
        setter: {
          componentName: 'MixedSetter',
          props: {
            setters: [
              {
                componentName: 'RadioGroupSetter',
                props: {
                  options: [
                    { label: 'small', value: 'small' },
                    { label: 'medium', value: 'medium' },
                    { label: 'large', value: 'large' },
                  ],
                  defaultValue: 'medium',
                },
              },
              'NumberSetter',
            ],
          },
        },
      },
    ],
    supports: {
      style: true,
      events: ['onClick', 'onError'],
    },
  },
  snippets: [
    {
      title: '头像',
      screenshot: avatarImage,
      schema: {
        componentName: 'NAvatar',
        props: {
          src: 'https://www.naiveui.com/assets/naivelogo-93278402.svg',
        },
      },
    },
  ],
};

export default meta;
