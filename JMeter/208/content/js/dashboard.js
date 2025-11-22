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

    var data = {"OkPercent": 99.44794952681389, "KoPercent": 0.5520504731861199};
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
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.5125472490550189, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [0.0, 500, 1500, "7.3 Safe to vaccinate"], "isController": false}, {"data": [0.03599374021909233, 500, 1500, "2.0 Register attendance"], "isController": true}, {"data": [0.8107255520504731, 500, 1500, "2.5 Select patient"], "isController": false}, {"data": [0.8212634822804314, 500, 1500, "2.3 Search by first/last name"], "isController": false}, {"data": [0.05161290322580645, 500, 1500, "4.0 Vaccination for flu"], "isController": true}, {"data": [0.07407407407407407, 500, 1500, "4.0 Vaccination for hpv"], "isController": true}, {"data": [0.7318731117824774, 500, 1500, "1.2 Sign-in page"], "isController": false}, {"data": [0.0, 500, 1500, "7.1 Name search"], "isController": false}, {"data": [0.1931166347992352, 500, 1500, "2.4 Patient attending session"], "isController": false}, {"data": [1.0, 500, 1500, "Check STS status"], "isController": false}, {"data": [0.7192192192192193, 500, 1500, "1.1 Homepage"], "isController": false}, {"data": [0.7145015105740181, 500, 1500, "1.3 Sign-in"], "isController": false}, {"data": [0.0, 500, 1500, "Run some searches"], "isController": true}, {"data": [0.047619047619047616, 500, 1500, "4.0 Vaccination for td_ipv"], "isController": true}, {"data": [0.5803981623277182, 500, 1500, "2.1 Open session"], "isController": false}, {"data": [0.1271186440677966, 500, 1500, "4.3 Vaccination confirm"], "isController": false}, {"data": [0.627435064935065, 500, 1500, "4.1 Vaccination questions"], "isController": false}, {"data": [1.0, 500, 1500, "Reset counters"], "isController": false}, {"data": [0.16691842900302115, 500, 1500, "1.0 Login"], "isController": true}, {"data": [0.04794520547945205, 500, 1500, "4.0 Vaccination for menacwy"], "isController": true}, {"data": [0.16666666666666666, 500, 1500, "7.0 Open Children Search"], "isController": false}, {"data": [1.0, 500, 1500, "Initialise vaccination list"], "isController": false}, {"data": [0.0, 500, 1500, "7.5 year group"], "isController": false}, {"data": [0.0, 500, 1500, "7.2 No Consent search"], "isController": false}, {"data": [0.540519877675841, 500, 1500, "1.4 Open Sessions list"], "isController": false}, {"data": [1.0, 500, 1500, "Reset vaccination list"], "isController": false}, {"data": [0.6598360655737705, 500, 1500, "4.2 Vaccination batch"], "isController": false}, {"data": [0.8110599078341014, 500, 1500, "2.2 Session register"], "isController": false}, {"data": [0.0, 500, 1500, "7.3 Due vaccination"], "isController": false}]}, function(index, item){
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
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 7608, 42, 0.5520504731861199, 1634.7712933753928, 2, 52639, 497.0, 3782.500000000002, 6091.199999999997, 23243.379999999997, 3.9640257369893934, 1618.472817304421, 19.051965997589697], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["7.3 Safe to vaccinate", 6, 0, 0.0, 25914.833333333332, 24331, 29619, 24757.5, 29619.0, 29619.0, 29619.0, 0.0035900541140823465, 1.4510783699837968, 0.015734534046876532], "isController": false}, {"data": ["2.0 Register attendance", 639, 31, 4.851330203442879, 6097.5242566510115, 555, 51321, 4315.0, 12341.0, 17357.0, 31050.600000000024, 0.36343285364746675, 714.4786686527505, 7.612334108223081], "isController": true}, {"data": ["2.5 Select patient", 634, 0, 0.0, 618.5189274447954, 67, 10728, 163.5, 1696.0, 2814.75, 6676.949999999992, 0.36392963644347753, 148.0122817955895, 1.5157295795435954], "isController": false}, {"data": ["2.3 Search by first/last name", 649, 0, 0.0, 685.6178736517719, 73, 21067, 161.0, 1621.0, 2828.0, 8928.5, 0.36632703803987376, 149.3709869259277, 1.585746786983085], "isController": false}, {"data": ["4.0 Vaccination for flu", 155, 0, 0.0, 7119.690322580645, 773, 34985, 5041.0, 17385.0, 19574.399999999976, 33621.399999999994, 0.09172992579344906, 108.43176935320194, 1.5363300393536177], "isController": true}, {"data": ["4.0 Vaccination for hpv", 162, 1, 0.6172839506172839, 7310.407407407407, 483, 35770, 5307.0, 15744.200000000017, 21708.3, 34190.59000000001, 0.09626291898881152, 113.17657695800708, 1.6087875343679419], "isController": true}, {"data": ["1.2 Sign-in page", 662, 0, 0.0, 1233.5679758308154, 18, 29851, 232.5, 2683.6000000000004, 4183.250000000001, 24849.94, 0.36959928626023025, 148.57990210887937, 1.8042701916291346], "isController": false}, {"data": ["7.1 Name search", 6, 0, 0.0, 6723.833333333333, 5320, 9203, 6443.5, 9203.0, 9203.0, 9203.0, 0.003603359051307629, 1.4565265240256966, 0.01561983424698504], "isController": false}, {"data": ["2.4 Patient attending session", 523, 31, 5.927342256214149, 3221.005736137668, 82, 43449, 1840.0, 6570.0, 8699.799999999994, 22987.31999999998, 0.2983572665682411, 121.2500417158224, 1.506689934349992], "isController": false}, {"data": ["Check STS status", 1, 0, 0.0, 29.0, 29, 29, 29.0, 29.0, 29.0, 29.0, 34.48275862068965, 10.809536637931034, 20.339439655172413], "isController": false}, {"data": ["1.1 Homepage", 666, 2, 0.3003003003003003, 1159.4219219219217, 36, 45598, 282.0, 2709.4000000000015, 3708.95, 23127.430000000102, 0.36997163550794443, 148.17409571516185, 1.7900493948241747], "isController": false}, {"data": ["1.3 Sign-in", 662, 1, 0.1510574018126888, 1433.6042296072505, 87, 30399, 328.5, 2942.9000000000015, 5344.400000000003, 26359.52, 0.36931906936057596, 148.59105696854735, 1.9386962946195454], "isController": false}, {"data": ["Run some searches", 5, 4, 80.0, 118574.4, 110802, 127469, 118881.0, 127469.0, 127469.0, 127469.0, 0.0034960658770685346, 6.397610046758133, 0.06710534572945065], "isController": true}, {"data": ["4.0 Vaccination for td_ipv", 147, 0, 0.0, 7024.646258503402, 441, 65109, 4538.0, 15021.20000000003, 22937.399999999994, 54469.80000000023, 0.08827826751197612, 104.93704714693797, 1.4838294303604576], "isController": true}, {"data": ["2.1 Open session", 653, 0, 0.0, 1457.9035222052087, 192, 29393, 628.0, 3310.400000000001, 4358.2, 19173.1000000001, 0.3669060827184987, 147.81001110164814, 1.530514019338142], "isController": false}, {"data": ["4.3 Vaccination confirm", 590, 3, 0.5084745762711864, 4436.533898305084, 838, 44025, 2669.5, 9345.9, 12929.749999999884, 29834.040000000037, 0.35810575409181344, 143.90497806545355, 2.1545227372116793], "isController": false}, {"data": ["4.1 Vaccination questions", 616, 0, 0.0, 1679.5827922077924, 110, 28455, 437.5, 4357.700000000002, 6199.249999999998, 23180.76000000001, 0.3633157278552871, 143.42084591723216, 2.076847280403363], "isController": false}, {"data": ["Reset counters", 1, 0, 0.0, 31.0, 31, 31, 31.0, 31.0, 31.0, 31.0, 32.25806451612903, 0.0, 0.0], "isController": false}, {"data": ["1.0 Login", 662, 4, 0.6042296072507553, 4913.113293051367, 673, 96712, 2558.0, 10474.300000000007, 13709.900000000003, 39188.680000000044, 0.3696265264542598, 612.9385190640324, 7.050103849280596], "isController": true}, {"data": ["4.0 Vaccination for menacwy", 146, 2, 1.36986301369863, 7949.623287671236, 565, 50698, 5166.5, 20964.90000000001, 26420.35000000001, 45016.17000000001, 0.08709086679272969, 102.53574556269051, 1.4543540959550467], "isController": true}, {"data": ["7.0 Open Children Search", 6, 0, 0.0, 21298.0, 245, 26496, 25024.5, 26496.0, 26496.0, 26496.0, 0.0036561288907304944, 1.7533435013070662, 0.015202926578838327], "isController": false}, {"data": ["Initialise vaccination list", 1, 0, 0.0, 44.0, 44, 44, 44.0, 44.0, 44.0, 44.0, 22.727272727272727, 6.525213068181818, 14.026988636363637], "isController": false}, {"data": ["7.5 year group", 5, 2, 40.0, 29559.8, 24800, 35421, 27707.0, 35421.0, 35421.0, 35421.0, 0.003772098841060352, 1.1251824575997231, 0.011557946605186485], "isController": false}, {"data": ["7.2 No Consent search", 6, 2, 33.333333333333336, 30782.833333333336, 27491, 41469, 28099.0, 41469.0, 41469.0, 41469.0, 0.003554613977808545, 1.2597970807880816, 0.011632913940722073], "isController": false}, {"data": ["1.4 Open Sessions list", 654, 1, 0.1529051987767584, 1094.3730886850167, 375, 31421, 624.0, 2168.5, 3019.25, 5058.850000000005, 0.3663243718293197, 168.13638993895572, 1.5222829559604167], "isController": false}, {"data": ["Reset vaccination list", 1, 0, 0.0, 2.0, 2, 2, 2.0, 2.0, 2.0, 2.0, 500.0, 143.06640625, 307.12890625], "isController": false}, {"data": ["4.2 Vaccination batch", 610, 0, 0.0, 1364.4442622950814, 96, 52639, 396.5, 3178.1999999999994, 4811.949999999979, 16275.309999999983, 0.3609424740535615, 143.44309661923378, 1.8791105282777718], "isController": false}, {"data": ["2.2 Session register", 651, 0, 0.0, 684.3010752688168, 76, 25626, 198.0, 1585.2000000000003, 2897.399999999999, 6333.480000000016, 0.3669067059386471, 153.72258045176304, 1.5337325997594535], "isController": false}, {"data": ["7.3 Due vaccination", 5, 0, 0.0, 24776.4, 24089, 25524, 24592.0, 25524.0, 25524.0, 25524.0, 0.0037714046068461553, 1.5243987956773668, 0.016471904261385492], "isController": false}]}, function(index, item){
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
    createTable($("#errorsTable"), {"supportsControllersDiscrimination": false, "titles": ["Type of error", "Number of errors", "% in errors", "% in all samples"], "items": [{"data": ["502/Bad Gateway", 13, 30.952380952380953, 0.17087276550998948], "isController": false}, {"data": ["Test failed: text expected to contain /is attending today&rsquo;s session.&lt;/p&gt;/", 29, 69.04761904761905, 0.3811777076761304], "isController": false}]}, function(index, item){
        switch(index){
            case 2:
            case 3:
                item = item.toFixed(2) + '%';
                break;
        }
        return item;
    }, [[1, 1]]);

        // Create top5 errors by sampler
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 7608, 42, "Test failed: text expected to contain /is attending today&rsquo;s session.&lt;/p&gt;/", 29, "502/Bad Gateway", 13, "", "", "", "", "", ""], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": ["2.4 Patient attending session", 523, 31, "Test failed: text expected to contain /is attending today&rsquo;s session.&lt;/p&gt;/", 29, "502/Bad Gateway", 2, "", "", "", "", "", ""], "isController": false}, {"data": [], "isController": false}, {"data": ["1.1 Homepage", 666, 2, "502/Bad Gateway", 2, "", "", "", "", "", "", "", ""], "isController": false}, {"data": ["1.3 Sign-in", 662, 1, "502/Bad Gateway", 1, "", "", "", "", "", "", "", ""], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": ["4.3 Vaccination confirm", 590, 3, "502/Bad Gateway", 3, "", "", "", "", "", "", "", ""], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": ["7.5 year group", 5, 2, "502/Bad Gateway", 2, "", "", "", "", "", "", "", ""], "isController": false}, {"data": ["7.2 No Consent search", 6, 2, "502/Bad Gateway", 2, "", "", "", "", "", "", "", ""], "isController": false}, {"data": ["1.4 Open Sessions list", 654, 1, "502/Bad Gateway", 1, "", "", "", "", "", "", "", ""], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
