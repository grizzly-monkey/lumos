import { ValueTransformer } from 'typeorm';

/**
 * Transforms a number array (`number[]`) into a Buffer for storage
 * in a BLOB column, and back again. Each number is stored as a 4-byte float.
 */
export class VectorTransformer implements ValueTransformer {
  /**
   * TO DATABASE: Converts the number array into a Buffer.
   */
  to(value: number[] | null): Buffer | null {
    if (!value) {
      return null;
    }
    // Create a buffer with 4 bytes for each float in the array.
    const buffer = Buffer.alloc(value.length * 4);
    value.forEach((val, index) => {
      buffer.writeFloatLE(val, index * 4);
    });
    return buffer;
  }

  /**
   * FROM DATABASE: Converts the Buffer back into a number array.
   */
  from(value: Buffer | null): number[] | null {
    if (!value || !Buffer.isBuffer(value)) {
      return null;
    }
    
    const result: number[] = [];
    // Ensure we don't read past the end of the buffer
    // We step by 4 bytes (size of a float)
    for (let i = 0; i <= value.length - 4; i += 4) {
      result.push(value.readFloatLE(i));
    }
    return result;
  }
}
