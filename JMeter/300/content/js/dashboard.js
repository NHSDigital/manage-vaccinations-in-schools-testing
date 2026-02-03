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

    var data = {"OkPercent": 99.98020063357973, "KoPercent": 0.01979936642027455};
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
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.8272079039324547, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [1.0, 500, 1500, "7.3 Safe to vaccinate"], "isController": false}, {"data": [0.4420149460282314, 500, 1500, "2.0 Register attendance"], "isController": true}, {"data": [0.9900138696255201, 500, 1500, "2.5 Select patient"], "isController": false}, {"data": [0.6545454545454545, 500, 1500, "7.1 Full name search"], "isController": false}, {"data": [0.9914198726819817, 500, 1500, "2.3 Search by first/last name"], "isController": false}, {"data": [0.4673913043478261, 500, 1500, "4.0 Vaccination for flu"], "isController": true}, {"data": [0.4685807150595883, 500, 1500, "4.0 Vaccination for hpv"], "isController": true}, {"data": [0.5555555555555556, 500, 1500, "7.6 First name search"], "isController": false}, {"data": [0.9816526229953791, 500, 1500, "1.2 Sign-in page"], "isController": false}, {"data": [0.739358218729535, 500, 1500, "2.4 Patient attending session"], "isController": false}, {"data": [1.0, 500, 1500, "Check STS status"], "isController": false}, {"data": [0.9839804507195221, 500, 1500, "1.1 Homepage"], "isController": false}, {"data": [0.9808267609464237, 500, 1500, "1.3 Sign-in"], "isController": false}, {"data": [0.0, 500, 1500, "Run some searches"], "isController": true}, {"data": [0.4730337078651685, 500, 1500, "4.0 Vaccination for td_ipv"], "isController": true}, {"data": [0.8275242047026279, 500, 1500, "2.1 Open session"], "isController": false}, {"data": [0.5, 500, 1500, "7.7 Partial name search"], "isController": false}, {"data": [0.6304103428892637, 500, 1500, "4.3 Vaccination confirm"], "isController": false}, {"data": [0.9871651785714286, 500, 1500, "4.1 Vaccination questions"], "isController": false}, {"data": [0.4351851851851852, 500, 1500, "7.7 Last name search"], "isController": false}, {"data": [1.0, 500, 1500, "Reset counters"], "isController": false}, {"data": [0.4757954854500952, 500, 1500, "1.0 Login"], "isController": true}, {"data": [0.4730337078651685, 500, 1500, "4.0 Vaccination for menacwy"], "isController": true}, {"data": [0.5181818181818182, 500, 1500, "7.0 Open Children Search"], "isController": false}, {"data": [1.0, 500, 1500, "Initialise vaccination list"], "isController": false}, {"data": [0.0, 500, 1500, "7.5 year group"], "isController": false}, {"data": [1.0, 500, 1500, "7.2 No Consent search"], "isController": false}, {"data": [1.0, 500, 1500, "Debug Sampler"], "isController": false}, {"data": [0.7391484655792093, 500, 1500, "1.4 Open Sessions list"], "isController": false}, {"data": [1.0, 500, 1500, "Reset vaccination list"], "isController": false}, {"data": [0.9875594073245737, 500, 1500, "4.2 Vaccination batch"], "isController": false}, {"data": [0.990868843386829, 500, 1500, "2.2 Session register"], "isController": false}, {"data": [0.9722222222222222, 500, 1500, "7.3 Due vaccination"], "isController": false}]}, function(index, item){
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
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 45456, 9, 0.01979936642027455, 248.67324445617677, 0, 8421, 116.0, 626.0, 783.9500000000007, 1263.9900000000016, 5.862463480512687, 2448.7739678732896, 44.66815195551029], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["7.3 Safe to vaccinate", 55, 0, 0.0, 102.47272727272724, 78, 196, 96.0, 136.99999999999997, 164.59999999999985, 196.0, 0.007750373708928656, 3.517269449853462, 0.0576512484108211], "isController": false}, {"data": ["2.0 Register attendance", 3613, 8, 0.22142264046498755, 1086.390810960419, 358, 3634, 1032.0, 1575.6, 1789.0, 2215.86, 0.5036416090213323, 1009.2096344826336, 16.545693135021953], "isController": true}, {"data": ["2.5 Select patient", 3605, 0, 0.0, 119.63495145631082, 56, 1144, 99.0, 170.4000000000001, 273.6999999999998, 634.8800000000001, 0.5044784532424741, 226.66585308802038, 3.6405907489479423], "isController": false}, {"data": ["7.1 Full name search", 55, 0, 0.0, 819.6181818181817, 204, 4779, 559.0, 1274.8, 3371.9999999999936, 4779.0, 0.00774761373496963, 3.5657313712149383, 0.057210322225016055], "isController": false}, {"data": ["2.3 Search by first/last name", 3613, 0, 0.0, 120.83227234984756, 62, 1920, 98.0, 172.0, 250.0, 612.5800000000004, 0.50382203326843, 228.1979619963854, 3.770009457906039], "isController": false}, {"data": ["4.0 Vaccination for flu", 874, 0, 0.0, 956.8878718535469, 208, 2793, 864.5, 1361.0, 1626.0, 2111.75, 0.12332994810970044, 162.98433459960842, 3.5166293598865255], "isController": true}, {"data": ["4.0 Vaccination for hpv", 923, 0, 0.0, 948.5016251354275, 187, 3252, 847.0, 1341.8000000000002, 1612.1999999999998, 2100.3599999999997, 0.13007087946938975, 171.46793605183407, 3.7063406398412737], "isController": true}, {"data": ["7.6 First name search", 54, 0, 0.0, 860.6481481481482, 302, 3120, 661.0, 1579.0, 2826.25, 3120.0, 0.007736206808864833, 4.284427620084912, 0.057074811492636636], "isController": false}, {"data": ["1.2 Sign-in page", 3679, 0, 0.0, 148.61375373742905, 15, 7367, 100.0, 240.0, 391.0, 787.5999999999995, 0.5113831754240283, 228.65390113217197, 4.400387735850991], "isController": false}, {"data": ["2.4 Patient attending session", 1527, 7, 0.45841519318926, 567.2586771447293, 60, 1936, 502.0, 820.2, 1028.1999999999998, 1429.88, 0.21339300325288077, 97.14121171830664, 1.8728564296380943], "isController": false}, {"data": ["Check STS status", 1, 0, 0.0, 44.0, 44, 44, 44.0, 44.0, 44.0, 44.0, 22.727272727272727, 7.124467329545455, 13.405539772727273], "isController": false}, {"data": ["1.1 Homepage", 3683, 0, 0.0, 144.0230790116746, 28, 7320, 102.0, 199.0, 333.0, 823.9199999999983, 0.5116873958181956, 228.568152643302, 4.396615504772392], "isController": false}, {"data": ["1.3 Sign-in", 3677, 0, 0.0, 155.03807451726917, 55, 5484, 104.0, 271.40000000000055, 402.0999999999999, 792.9599999999964, 0.5112426101319748, 228.69755563865007, 4.523477967652469], "isController": false}, {"data": ["Run some searches", 54, 0, 0.0, 6709.1296296296305, 3767, 16951, 5562.5, 11352.5, 14014.5, 16951.0, 0.007740894486160858, 31.25488789554179, 0.45903801082019363], "isController": true}, {"data": ["4.0 Vaccination for td_ipv", 890, 0, 0.0, 960.7056179775271, 216, 2640, 877.5, 1333.0, 1570.5999999999995, 2001.7100000000005, 0.12609838422631062, 167.1092687760583, 3.596408354731686], "isController": true}, {"data": ["2.1 Open session", 3615, 1, 0.027662517289073305, 476.6387275242055, 121, 3152, 429.0, 839.0, 1004.5999999999995, 1387.0800000000054, 0.5034391929709583, 225.07715663680128, 3.6374031131969446], "isController": false}, {"data": ["7.7 Partial name search", 54, 0, 0.0, 1278.5, 244, 6354, 763.0, 3726.0, 4624.25, 6354.0, 0.00774695573332109, 4.286930159400788, 0.057146547610422815], "isController": false}, {"data": ["4.3 Vaccination confirm", 3558, 0, 0.0, 665.3159078133772, 395, 2799, 598.0, 983.0999999999999, 1194.0499999999997, 1737.4099999999999, 0.5047195104305862, 225.42960834389265, 5.205697243787113], "isController": false}, {"data": ["4.1 Vaccination questions", 3584, 0, 0.0, 148.34654017857093, 69, 1517, 113.0, 225.5, 355.0, 713.0, 0.5045728320755147, 220.69714700663118, 4.7346674001937625], "isController": false}, {"data": ["7.7 Last name search", 54, 0, 0.0, 1445.4074074074074, 392, 8421, 785.0, 3331.0, 6203.5, 8421.0, 0.007739564236734923, 4.289434151366456, 0.05711483762967533], "isController": false}, {"data": ["Reset counters", 1, 0, 0.0, 50.0, 50, 50, 50.0, 50.0, 50.0, 50.0, 20.0, 0.0, 0.0], "isController": false}, {"data": ["1.0 Login", 3677, 1, 0.027196083763937992, 960.8689148762548, 244, 20171, 872.0, 1295.0, 1499.0, 2262.6599999999994, 0.5113392290083565, 940.242899366611, 16.947654837302828], "isController": true}, {"data": ["4.0 Vaccination for menacwy", 890, 0, 0.0, 950.7887640449422, 204, 3060, 869.5, 1373.6999999999998, 1534.4499999999998, 2015.0900000000001, 0.12575436724429367, 166.34079516645605, 3.5883283441936595], "isController": true}, {"data": ["7.0 Open Children Search", 55, 0, 0.0, 1192.1090909090906, 266, 5644, 674.0, 3445.2, 4105.4, 5644.0, 0.007736990707311471, 4.2549399059139725, 0.05583656510951991], "isController": false}, {"data": ["Initialise vaccination list", 1, 0, 0.0, 42.0, 42, 42, 42.0, 42.0, 42.0, 42.0, 23.809523809523807, 6.8359375, 14.694940476190474], "isController": false}, {"data": ["7.5 year group", 54, 0, 0.0, 1936.2222222222224, 1615, 4031, 1837.5, 2296.5, 2422.5, 4031.0, 0.0077328810838978934, 4.287474772370473, 0.057709785590477784], "isController": false}, {"data": ["7.2 No Consent search", 55, 0, 0.0, 104.23636363636368, 77, 223, 94.0, 144.0, 160.59999999999994, 223.0, 0.007748643036498785, 3.5164840372406125, 0.05777458139893156], "isController": false}, {"data": ["Debug Sampler", 3613, 0, 0.0, 0.5873235538333793, 0, 23, 1.0, 1.0, 1.0, 1.0, 0.5038338366326106, 2.8588090388878005, 0.0], "isController": false}, {"data": ["1.4 Open Sessions list", 3617, 1, 0.027647221454243847, 521.6624274260425, 288, 2258, 515.0, 784.2000000000003, 864.0, 1094.2800000000007, 0.5033590904188512, 254.64083140966986, 3.6324261274088556], "isController": false}, {"data": ["Reset vaccination list", 1, 0, 0.0, 3.0, 3, 3, 3.0, 3.0, 3.0, 3.0, 333.3333333333333, 95.37760416666667, 204.75260416666666], "isController": false}, {"data": ["4.2 Vaccination batch", 3577, 0, 0.0, 144.06793402292436, 64, 1663, 108.0, 225.20000000000027, 358.0, 678.8799999999992, 0.503969907769421, 221.87078477652133, 4.471730315806466], "isController": false}, {"data": ["2.2 Session register", 3614, 0, 0.0, 129.32650802434912, 61, 1310, 96.0, 223.0, 352.25, 605.0, 0.5035374410879307, 230.33314657859614, 3.6427394888997444], "isController": false}, {"data": ["7.3 Due vaccination", 54, 0, 0.0, 157.2222222222222, 76, 864, 97.5, 399.0, 615.25, 864.0, 0.007735703667540086, 3.5106119014123247, 0.057436228748123916], "isController": false}]}, function(index, item){
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
    createTable($("#errorsTable"), {"supportsControllersDiscrimination": false, "titles": ["Type of error", "Number of errors", "% in errors", "% in all samples"], "items": [{"data": ["Test failed: text expected to contain /is attending today&rsquo;s session.&lt;/p&gt;/", 7, 77.77777777777777, 0.015399507215769095], "isController": false}, {"data": ["Assertion failed", 2, 22.22222222222222, 0.004399859204505456], "isController": false}]}, function(index, item){
        switch(index){
            case 2:
            case 3:
                item = item.toFixed(2) + '%';
                break;
        }
        return item;
    }, [[1, 1]]);

        // Create top5 errors by sampler
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 45456, 9, "Test failed: text expected to contain /is attending today&rsquo;s session.&lt;/p&gt;/", 7, "Assertion failed", 2, "", "", "", "", "", ""], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": ["2.4 Patient attending session", 1527, 7, "Test failed: text expected to contain /is attending today&rsquo;s session.&lt;/p&gt;/", 7, "", "", "", "", "", "", "", ""], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": ["2.1 Open session", 3615, 1, "Assertion failed", 1, "", "", "", "", "", "", "", ""], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": ["1.4 Open Sessions list", 3617, 1, "Assertion failed", 1, "", "", "", "", "", "", "", ""], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
