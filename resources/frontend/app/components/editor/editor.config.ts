import { Quill } from 'react-quill';
import katex from 'katex';
import 'katex/dist/katex.min.css';

export function registerQuillExtensions(QuillInstance: any) {
  // Make katex available globally for Quill's formula module
  if (typeof window !== 'undefined') {
    (window as any).katex = katex;
  }

  // Override Quill's default List to support 'alpha'
  const ListContainer = QuillInstance.import('list') || QuillInstance.import('formats/list');
  if (ListContainer && ListContainer.blotName === 'list') {
    class CustomList extends ListContainer {
      static create(value: any) {
        if (value === 'alpha') {
          const node = super.create('ordered');
          node.classList.add('ql-alpha-list');
          return node;
        }
        return super.create(value);
      }
      static formats(domNode: Element) {
        if (domNode.tagName === 'OL' && domNode.classList.contains('ql-alpha-list')) {
          return 'alpha';
        }
        return super.formats(domNode);
      }
    }
    QuillInstance.register(CustomList, true);
  }

  // Register custom Divider Blot (BlockEmbed)
  const BlockEmbed = QuillInstance.import('blots/block/embed') as any;
  class DividerBlot extends BlockEmbed {
    static blotName = 'divider';
    static tagName = 'hr';
    static create() {
      const node = super.create();
      node.setAttribute('contenteditable', 'false');
      return node;
    }
  }
  DividerBlot.blotName = 'divider';
  DividerBlot.tagName = 'hr';
  QuillInstance.register(DividerBlot);

  const ImageFormat = QuillInstance.import('formats/image') as any;
  class CustomImage extends ImageFormat {
    static create(value: any) {
      if (typeof value === 'string') {
        return super.create(value);
      }
      const node = super.create(value.src);
      if (value.layout) node.setAttribute('data-layout', value.layout);
      if (value.alt) node.setAttribute('alt', value.alt);
      return node;
    }
    static formats(domNode: Element) {
      return {
        layout: domNode.getAttribute('data-layout') || 'inline',
        alt: domNode.getAttribute('alt') || ''
      };
    }
    format(name: string, value: any) {
      if (name === 'layout') {
        if (value) {
          this.domNode.setAttribute('data-layout', value);
        } else {
          this.domNode.removeAttribute('data-layout');
        }
      } else if (name === 'alt') {
        if (value) {
          this.domNode.setAttribute('alt', value);
        } else {
          this.domNode.removeAttribute('alt');
        }
      } else {
        super.format(name, value);
      }
    }
  }
  QuillInstance.register(CustomImage, true);
}
