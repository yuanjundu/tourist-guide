/*****************************************************************************
* $Id: idrisi.h b1c9c12ad373e40b955162b45d704070d4ebf7b0 2019-06-19 16:50:15 +0200 Even Rouault $
*
* Project:  Idrisi Raster Image File Driver
* Purpose:  Read/write Idrisi Raster Image Format RST
* Author:   Ivan Lucena, [lucena_ivan at hotmail.com]
*
******************************************************************************
* Copyright( c ) 2006, Ivan Lucena
 * Copyright (c) 2011, Even Rouault <even dot rouault at spatialys.com>
*
* Permission is hereby granted, free of charge, to any person obtaining a
* copy of this software and associated documentation files( the "Software" ),
* to deal in the Software without restriction, including without limitation
* the rights to use, copy, modify, merge, publish, distribute, sublicense,
* and/or sell copies of the Software, and to permit persons to whom the
* Software is furnished to do so, subject to the following conditions:
*
* The above copyright notice and this permission notice shall be included
* in all copies or substantial portions of the Software.
*
* THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
* OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
* FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL
* THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
* LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
* FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER
* DEALINGS IN THE SOFTWARE.
****************************************************************************/

#ifndef IDRISI_H_INCLUDED
#define IDRISI_H_INCLUDED

#include "cpl_error.h"

CPLErr IdrisiGeoReference2Wkt( const char* pszFilename,
                               const char *pszRefSystem,
                               const char *pszRefUnits,
                               char **ppszProjString );

#endif /*  IDRISI_H_INCLUDED */
