/*
   Licensed to the Apache Software Foundation (ASF) under one or more
   contributor license agreements.  See the NOTICE file distributed with
   this work for additional information regarding copyright ownership.
   The ASF licenses this file to You under the Apache License, Version 2.0
   (the "License"); you may not use this file except in compliance with
   the License.  You may obtain a copy of the License at

       http://www.apache.org/licenses/LICENSE-2.0

   Unless required by applicable law or agreed to in writing, software
   distributed under the License is distributed on an "AS IS" BASIS,
   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   See the License for the specific language governing permissions and
   limitations under the License.
*/
var showControllersOnly = false;
var seriesFilter = "";
var filtersOnlySampleSeries = true;

/*
 * Add header in statistics table to group metrics by category
 * format
 *
 */
function summaryTableHeader(header) {
    var newRow = header.insertRow(-1);
    newRow.className = "tablesorter-no-sort";
    var cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 1;
    cell.innerHTML = "Requests";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 3;
    cell.innerHTML = "Executions";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 7;
    cell.innerHTML = "Response Times (ms)";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 1;
    cell.innerHTML = "Throughput";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 2;
    cell.innerHTML = "Network (KB/sec)";
    newRow.appendChild(cell);
}

/*
 * Populates the table identified by id parameter with the specified data and
 * format
 *
 */
function createTable(table, info, formatter, defaultSorts, seriesIndex, headerCreator) {
    var tableRef = table[0];

    // Create header and populate it with data.titles array
    var header = tableRef.createTHead();

    // Call callback is available
    if(headerCreator) {
        headerCreator(header);
    }

    var newRow = header.insertRow(-1);
    for (var index = 0; index < info.titles.length; index++) {
        var cell = document.createElement('th');
        cell.innerHTML = info.titles[index];
        newRow.appendChild(cell);
    }

    var tBody;

    // Create overall body if defined
    if(info.overall){
        tBody = document.createElement('tbody');
        tBody.className = "tablesorter-no-sort";
        tableRef.appendChild(tBody);
        var newRow = tBody.insertRow(-1);
        var data = info.overall.data;
        for(var index=0;index < data.length; index++){
            var cell = newRow.insertCell(-1);
            cell.innerHTML = formatter ? formatter(index, data[index]): data[index];
        }
    }

    // Create regular body
    tBody = document.createElement('tbody');
    tableRef.appendChild(tBody);

    var regexp;
    if(seriesFilter) {
        regexp = new RegExp(seriesFilter, 'i');
    }
    // Populate body with data.items array
    for(var index=0; index < info.items.length; index++){
        var item = info.items[index];
        if((!regexp || filtersOnlySampleSeries && !info.supportsControllersDiscrimination || regexp.test(item.data[seriesIndex]))
                &&
                (!showControllersOnly || !info.supportsControllersDiscrimination || item.isController)){
            if(item.data.length > 0) {
                var newRow = tBody.insertRow(-1);
                for(var col=0; col < item.data.length; col++){
                    var cell = newRow.insertCell(-1);
                    cell.innerHTML = formatter ? formatter(col, item.data[col]) : item.data[col];
                }
            }
        }
    }

    // Add support of columns sort
    table.tablesorter({sortList : defaultSorts});
}

$(document).ready(function() {

    // Customize table sorter default options
    $.extend( $.tablesorter.defaults, {
        theme: 'blue',
        cssInfoBlock: "tablesorter-no-sort",
        widthFixed: true,
        widgets: ['zebra']
    });

    var data = {"OkPercent": 99.8915554717337, "KoPercent": 0.10844452826630205};
    var dataset = [
        {
            "label" : "FAIL",
            "data" : data.KoPercent,
            "color" : "#FF6347"
        },
        {
            "label" : "PASS",
            "data" : data.OkPercent,
            "color" : "#9ACD32"
        }];
    $.plot($("#flot-requests-summary"), dataset, {
        series : {
            pie : {
                show : true,
                radius : 1,
                label : {
                    show : true,
                    radius : 3 / 4,
                    formatter : function(label, series) {
                        return '<div style="font-size:8pt;text-align:center;padding:2px;color:white;">'
                            + label
                            + '<br/>'
                            + Math.round10(series.percent, -2)
                            + '%</div>';
                    },
                    background : {
                        opacity : 0.5,
                        color : '#000'
                    }
                }
            }
        },
        legend : {
            show : true
        }
    });

    // Creates APDEX table
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.794925600915681, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [1.0, 500, 1500, "7.3 Safe to vaccinate"], "isController": false}, {"data": [0.3061101028433152, 500, 1500, "2.0 Register attendance"], "isController": true}, {"data": [0.9854280510018215, 500, 1500, "2.5 Select patient"], "isController": false}, {"data": [0.7037037037037037, 500, 1500, "7.1 Full name search"], "isController": false}, {"data": [0.9864212432106216, 500, 1500, "2.3 Search by first/last name"], "isController": false}, {"data": [0.4380952380952381, 500, 1500, "4.0 Vaccination for flu"], "isController": true}, {"data": [0.4510739856801909, 500, 1500, "4.0 Vaccination for hpv"], "isController": true}, {"data": [0.4444444444444444, 500, 1500, "7.6 First name search"], "isController": false}, {"data": [0.9731879787860931, 500, 1500, "1.2 Sign-in page"], "isController": false}, {"data": [0.6379962192816635, 500, 1500, "2.4 Patient attending session"], "isController": false}, {"data": [1.0, 500, 1500, "Check STS status"], "isController": false}, {"data": [0.9785294117647059, 500, 1500, "1.1 Homepage"], "isController": false}, {"data": [0.974366529169122, 500, 1500, "1.3 Sign-in"], "isController": false}, {"data": [0.0, 500, 1500, "Run some searches"], "isController": true}, {"data": [0.42071611253196933, 500, 1500, "4.0 Vaccination for td_ipv"], "isController": true}, {"data": [0.7181490384615384, 500, 1500, "2.1 Open session"], "isController": false}, {"data": [0.46296296296296297, 500, 1500, "7.7 Partial name search"], "isController": false}, {"data": [0.533083645443196, 500, 1500, "4.3 Vaccination confirm"], "isController": false}, {"data": [0.9754450583179864, 500, 1500, "4.1 Vaccination questions"], "isController": false}, {"data": [0.37037037037037035, 500, 1500, "7.7 Last name search"], "isController": false}, {"data": [1.0, 500, 1500, "Reset counters"], "isController": false}, {"data": [0.4616971125515616, 500, 1500, "1.0 Login"], "isController": true}, {"data": [0.45050761421319796, 500, 1500, "4.0 Vaccination for menacwy"], "isController": true}, {"data": [0.5, 500, 1500, "7.0 Open Children Search"], "isController": false}, {"data": [1.0, 500, 1500, "Initialise vaccination list"], "isController": false}, {"data": [0.0, 500, 1500, "7.5 year group"], "isController": false}, {"data": [1.0, 500, 1500, "7.2 No Consent search"], "isController": false}, {"data": [1.0, 500, 1500, "Debug Sampler"], "isController": false}, {"data": [0.7560024009603842, 500, 1500, "1.4 Open Sessions list"], "isController": false}, {"data": [1.0, 500, 1500, "Reset vaccination list"], "isController": false}, {"data": [0.9756773399014779, 500, 1500, "4.2 Vaccination batch"], "isController": false}, {"data": [0.9852675886951293, 500, 1500, "2.2 Session register"], "isController": false}, {"data": [0.9814814814814815, 500, 1500, "7.3 Due vaccination"], "isController": false}]}, function(index, item){
        switch(index){
            case 0:
                item = item.toFixed(3);
                break;
            case 1:
            case 2:
                item = formatDuration(item);
                break;
        }
        return item;
    }, [[0, 0]], 3);

    // Create statistics table
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 21209, 23, 0.10844452826630205, 287.7710877457663, 0, 16967, 122.0, 721.0, 914.0, 1611.9800000000032, 5.547502303067461, 2315.272493398462, 41.720170045109256], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["7.3 Safe to vaccinate", 27, 0, 0.0, 95.99999999999999, 77, 143, 92.0, 129.2, 139.39999999999998, 143.0, 0.007850302294788737, 3.553345861531425, 0.057698358966993255], "isController": false}, {"data": ["2.0 Register attendance", 1653, 23, 1.3914095583787054, 1435.7574107683001, 396, 5327, 1363.0, 2172.8, 2496.7, 3141.960000000001, 0.4627681598708616, 971.1338504388704, 15.878910465751796], "isController": true}, {"data": ["2.5 Select patient", 1647, 0, 0.0, 125.51487553126886, 53, 1807, 93.0, 191.0, 334.599999999999, 841.9599999999996, 0.46244118405159124, 207.21972160995094, 3.296571797170124], "isController": false}, {"data": ["7.1 Full name search", 27, 0, 0.0, 634.5555555555555, 268, 1913, 547.0, 1023.2, 1562.199999999998, 1913.0, 0.007841658900035985, 3.595991963406899, 0.057213081415442665], "isController": false}, {"data": ["2.3 Search by first/last name", 1657, 0, 0.0, 132.11526855763418, 59, 1865, 100.0, 183.0, 308.0999999999999, 890.6800000000003, 0.46385539133214676, 209.5301810894982, 3.43023594443981], "isController": false}, {"data": ["4.0 Vaccination for flu", 420, 0, 0.0, 1091.9642857142853, 224, 3356, 950.5, 1635.4, 1998.5499999999993, 2908.260000000008, 0.11983620103264565, 157.6084857779395, 3.369359968046533], "isController": true}, {"data": ["4.0 Vaccination for hpv", 419, 0, 0.0, 1057.3317422434382, 192, 3099, 958.0, 1575.0, 1810.0, 2345.8000000000006, 0.11950055044406291, 156.61947337806166, 3.353952388460211], "isController": true}, {"data": ["7.6 First name search", 27, 0, 0.0, 1655.4814814814813, 572, 16967, 926.0, 2785.9999999999995, 11424.19999999997, 16967.0, 0.007853620155298066, 4.340334084275161, 0.05725689046090569], "isController": false}, {"data": ["1.2 Sign-in page", 1697, 0, 0.0, 168.8073070123746, 15, 5373, 108.0, 288.0, 500.1999999999998, 1194.4599999999996, 0.47250715582433983, 210.54465430381416, 3.9633463911465467], "isController": false}, {"data": ["2.4 Patient attending session", 1058, 23, 2.1739130434782608, 623.0340264650276, 46, 2303, 555.0, 918.1, 1131.6499999999994, 1611.6400000000003, 0.29922439227469366, 135.43870063389684, 2.587280737440353], "isController": false}, {"data": ["Check STS status", 1, 0, 0.0, 27.0, 27, 27, 27.0, 27.0, 27.0, 27.0, 37.03703703703704, 11.610243055555555, 21.846064814814817], "isController": false}, {"data": ["1.1 Homepage", 1700, 0, 0.0, 152.71588235294112, 26, 5022, 106.0, 224.0, 353.7999999999993, 981.97, 0.4725421069763059, 210.36040116557723, 3.955224939337407], "isController": false}, {"data": ["1.3 Sign-in", 1697, 0, 0.0, 176.34708308780225, 62, 5111, 111.0, 321.0, 484.1999999999998, 1080.019999999999, 0.4726230915788703, 210.80628903030873, 4.124198162165978], "isController": false}, {"data": ["Run some searches", 27, 0, 0.0, 7370.925925925926, 4311, 33226, 6369.0, 9157.0, 23622.39999999995, 33226.0, 0.00781723874860484, 31.46573124749378, 0.4580370918026118], "isController": true}, {"data": ["4.0 Vaccination for td_ipv", 391, 0, 0.0, 1137.1406649616367, 658, 4174, 985.0, 1772.0000000000005, 2024.3999999999992, 2696.279999999997, 0.11300280830764277, 148.9795868762917, 3.1767439764409375], "isController": true}, {"data": ["2.1 Open session", 1664, 0, 0.0, 638.0156250000007, 113, 3295, 511.5, 1235.5, 1509.0, 2069.7, 0.464520307409713, 207.09842123245485, 3.314837824417465], "isController": false}, {"data": ["7.7 Partial name search", 27, 0, 0.0, 1452.5925925925926, 392, 7401, 882.0, 3976.7999999999993, 6405.399999999994, 7401.0, 0.00789001897987899, 4.339186824873723, 0.05751426595792866], "isController": false}, {"data": ["4.3 Vaccination confirm", 1602, 0, 0.0, 769.7047440699139, 445, 3134, 681.0, 1134.6000000000004, 1438.8999999999987, 2155.4300000000003, 0.46221427180334257, 205.84742467063265, 4.710451124158774], "isController": false}, {"data": ["4.1 Vaccination questions", 1629, 0, 0.0, 173.11356660527966, 66, 1623, 117.0, 288.0, 483.0, 1053.9000000000026, 0.4624219042074148, 201.69734428043503, 4.289691295500229], "isController": false}, {"data": ["7.7 Last name search", 27, 0, 0.0, 1234.3703703703704, 752, 2379, 1123.0, 1808.8, 2163.3999999999987, 2379.0, 0.007889412641994819, 4.362802388220172, 0.057510131412047076], "isController": false}, {"data": ["Reset counters", 1, 0, 0.0, 14.0, 14, 14, 14.0, 14.0, 14.0, 14.0, 71.42857142857143, 0.0, 0.0], "isController": false}, {"data": ["1.0 Login", 1697, 0, 0.0, 1008.9811431938706, 308, 15399, 884.0, 1421.0000000000002, 1729.1, 2799.7999999999993, 0.4724830809572056, 865.6947453401982, 15.34688305424256], "isController": true}, {"data": ["4.0 Vaccination for menacwy", 394, 0, 0.0, 1079.0355329949243, 212, 2632, 983.5, 1548.0, 1889.0, 2444.4500000000007, 0.11339849237567826, 149.0270251056779, 3.1852899998251534], "isController": true}, {"data": ["7.0 Open Children Search", 28, 0, 0.0, 1103.678571428571, 377, 4981, 752.5, 2397.8000000000015, 4295.649999999996, 4981.0, 0.007849073528999523, 4.276930655274998, 0.05594983425840271], "isController": false}, {"data": ["Initialise vaccination list", 1, 0, 0.0, 41.0, 41, 41, 41.0, 41.0, 41.0, 41.0, 24.390243902439025, 7.002667682926829, 15.053353658536585], "isController": false}, {"data": ["7.5 year group", 27, 0, 0.0, 2073.148148148148, 1681, 4683, 1885.0, 2519.6, 3927.399999999996, 4683.0, 0.007845767324761882, 4.339731766200638, 0.05785657477844425], "isController": false}, {"data": ["7.2 No Consent search", 27, 0, 0.0, 98.99999999999997, 77, 142, 96.0, 125.6, 137.99999999999997, 142.0, 0.007849163497203517, 3.552612933837075, 0.05782796257954909], "isController": false}, {"data": ["Debug Sampler", 1657, 0, 0.0, 0.266747133373567, 0, 16, 0.0, 1.0, 1.0, 1.0, 0.4638705843061692, 2.658742930400236, 0.0], "isController": false}, {"data": ["1.4 Open Sessions list", 1666, 0, 0.0, 520.5324129651857, 297, 2425, 491.5, 801.3, 896.6499999999999, 1152.6399999999994, 0.46430637755187354, 234.3107180026263, 3.3094512214239766], "isController": false}, {"data": ["Reset vaccination list", 1, 0, 0.0, 2.0, 2, 2, 2.0, 2.0, 2.0, 2.0, 500.0, 143.06640625, 307.12890625], "isController": false}, {"data": ["4.2 Vaccination batch", 1624, 0, 0.0, 159.7062807881771, 61, 2394, 107.0, 274.5, 480.5, 933.0, 0.46243630466693336, 203.0280972011427, 4.053869974226437], "isController": false}, {"data": ["2.2 Session register", 1663, 0, 0.0, 143.9831629585088, 59, 3016, 98.0, 279.0, 395.79999999999995, 784.3599999999924, 0.46466324069499987, 213.2944125734052, 3.319939385878233], "isController": false}, {"data": ["7.3 Due vaccination", 27, 0, 0.0, 125.7777777777778, 77, 527, 97.0, 192.39999999999986, 452.9999999999996, 527.0, 0.007849015181158178, 3.552545804454287, 0.05758158815083598], "isController": false}]}, function(index, item){
        switch(index){
            // Errors pct
            case 3:
                item = item.toFixed(2) + '%';
                break;
            // Mean
            case 4:
            // Mean
            case 7:
            // Median
            case 8:
            // Percentile 1
            case 9:
            // Percentile 2
            case 10:
            // Percentile 3
            case 11:
            // Throughput
            case 12:
            // Kbytes/s
            case 13:
            // Sent Kbytes/s
                item = item.toFixed(2);
                break;
        }
        return item;
    }, [[0, 0]], 0, summaryTableHeader);

    // Create error table
    createTable($("#errorsTable"), {"supportsControllersDiscrimination": false, "titles": ["Type of error", "Number of errors", "% in errors", "% in all samples"], "items": [{"data": ["Test failed: text expected to contain /is attending today&rsquo;s session.&lt;/p&gt;/", 23, 100.0, 0.10844452826630205], "isController": false}]}, function(index, item){
        switch(index){
            case 2:
            case 3:
                item = item.toFixed(2) + '%';
                break;
        }
        return item;
    }, [[1, 1]]);

        // Create top5 errors by sampler
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 21209, 23, "Test failed: text expected to contain /is attending today&rsquo;s session.&lt;/p&gt;/", 23, "", "", "", "", "", "", "", ""], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": ["2.4 Patient attending session", 1058, 23, "Test failed: text expected to contain /is attending today&rsquo;s session.&lt;/p&gt;/", 23, "", "", "", "", "", "", "", ""], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
