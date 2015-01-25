"""
Methods for processing images
"""

import cv2
import numpy



CV_LOAD_IMAGE_ANYDEPTH = -1
CV_LOAD_IMAGE_COLOR = 1
CV_LOAD_IMAGE_GRAYSCALE = 0



def map_image(in_image, fn, out_image=None):
    """
    Run fn over all pixels in in_image
    """
    shape = in_image.shape
    height = shape[0]
    width = shape[1]
    print 'Mapping over image of shape %s' % (shape,)
    
    if out_image is None:
        out_image = numpy.empty(shape=shape)
    for y in xrange(height):
        for x in xrange(width):
            pixel = in_image[y, x]
            out_image[y, x] = fn(pixel, y, x, in_image)
    return out_image


def grayscale(image):
    height, width = image.shape[0], image.shape[1]
    out_image = numpy.empty(shape=(height, width))

    def fn(pixel, *res):
        # print pixel
        return pixel[0]*0.2126 + pixel[1]*0.7152 + pixel[2]*0.722

    map_image(image, fn, out_image=out_image)

    return out_image



def save_image(image, path):
    """
    Saves image to path.
    """
    cv2.imwrite(path, image)


def read_image(path, flags=CV_LOAD_IMAGE_ANYDEPTH):
    """
    Loads image from path and return numpy of it.
    """
    return cv2.imread(path, flags)


def show_image(image, name='Image'):
    """
    Show image(s) in window.
    """
    cv2.imshow(name, image)
    cv2.waitKey(0)
    cv2.destroyAllWindows()



def main():
    """
    Main function
    """
    import argparse

    parser = argparse.ArgumentParser(description='Image processing methods')
    parser.add_argument('--file', help='Path to file for parsing')
    parser.add_argument('-g', '--grayscale', action='store_true', default=False)

    args = parser.parse_args()
    if args.file:
        img = read_image(args.file)

        if args.grayscale:
            img = grayscale(img)

        show_image(img)
    else:
        parser.print_help()



if __name__ == '__main__':
    main()
