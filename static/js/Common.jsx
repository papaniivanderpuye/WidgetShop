import { transform, isEqual, isObject } from 'lodash';
import styled from "tachyons-components";

export function difference(object, base) {
  return transform(object, (result, value, key) => {
    if (!isEqual(value, base[key])) {
      result[key] =
        isObject(value) && isObject(base[key])
          ? difference(value, base[key])
          : value;
    }
  });
}

export const Article = styled('div')`
items-center justify-center flex flex-column flex-wrap`;

export const Section = styled('div')`
flex flex-wrap content-center justify-center w-100 h-50`;
