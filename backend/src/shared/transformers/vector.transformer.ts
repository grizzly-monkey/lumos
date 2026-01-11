import { ValueTransformer } from 'typeorm';

/**
 * Transforms a number array (`number[]`) into a hexadecimal string literal
 * for MariaDB's VECTOR type, and parses the Buffer from the DB back to a number array.
 */
export class VectorTransformer implements ValueTransformer {
  /**
   * TO DATABASE: Converts the number array into a hex string literal (e.g., x'...')
   */
  to(value: number[] | null): string | null {
    if (!value) {
      return null;
    }
    // Create a buffer and write each float to it.
    const buffer = Buffer.alloc(value.length * 4);
    value.forEach((val, index) => {
      buffer.writeFloatLE(val, index * 4);
    });
    // Return as a hexadecimal string literal.
    return `x'${buffer.toString('hex')}'`;
  }

  /**
   * FROM DATABASE: Converts the Buffer from the database back into a number array.
   */
  from(value: Buffer | null): number[] | null {
    if (!value) {
      return null;
    }
    const result: number[] = [];
    for (let i = 0; i < value.length; i += 4) {
      result.push(value.readFloatLE(i));
    }
    return result;
  }
}
