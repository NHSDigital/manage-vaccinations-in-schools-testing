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

    var data = {"OkPercent": 100.0, "KoPercent": 0.0};
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
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.33112607840169517, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [0.0, 500, 1500, "5.0 Consent for menacwy"], "isController": true}, {"data": [0.0, 500, 1500, "2.0 Register attendance"], "isController": true}, {"data": [0.7156028368794326, 500, 1500, "2.5 Select patient"], "isController": false}, {"data": [0.5, 500, 1500, "1.4 Select Organisations"], "isController": false}, {"data": [0.6680161943319838, 500, 1500, "2.5 Select menacwy"], "isController": false}, {"data": [0.2916083916083916, 500, 1500, "2.3 Search by first/last name"], "isController": false}, {"data": [0.6729559748427673, 500, 1500, "2.5 Select td_ipv"], "isController": false}, {"data": [0.002911208151382824, 500, 1500, "4.0 Vaccination for hpv"], "isController": true}, {"data": [0.2962962962962963, 500, 1500, "5.8 Consent confirm"], "isController": false}, {"data": [1.0, 500, 1500, "1.2 Sign-in page"], "isController": false}, {"data": [0.7592592592592593, 500, 1500, "5.9 Patient home page"], "isController": false}, {"data": [0.15912305516265912, 500, 1500, "2.4 Patient attending session"], "isController": false}, {"data": [0.42592592592592593, 500, 1500, "5.4 Consent route"], "isController": false}, {"data": [0.9285714285714286, 500, 1500, "1.1 Homepage"], "isController": false}, {"data": [0.4928571428571429, 500, 1500, "1.3 Sign-in"], "isController": false}, {"data": [0.0021231422505307855, 500, 1500, "4.0 Vaccination for td_ipv"], "isController": true}, {"data": [0.0, 500, 1500, "2.1 Open session"], "isController": false}, {"data": [0.20246153846153847, 500, 1500, "4.3 Vaccination confirm"], "isController": false}, {"data": [0.42592592592592593, 500, 1500, "5.6 Consent questions"], "isController": false}, {"data": [0.45813106796116504, 500, 1500, "4.1 Vaccination questions"], "isController": false}, {"data": [0.46296296296296297, 500, 1500, "5.3 Consent parent details"], "isController": false}, {"data": [0.48148148148148145, 500, 1500, "5.2 Consent who"], "isController": false}, {"data": [0.0, 500, 1500, "1.0 Login"], "isController": true}, {"data": [0.0051440329218107, 500, 1500, "4.0 Vaccination for menacwy"], "isController": true}, {"data": [0.0, 500, 1500, "5.0 Consent for td_ipv"], "isController": true}, {"data": [0.698140200286123, 500, 1500, "2.5 Select hpv"], "isController": false}, {"data": [0.42592592592592593, 500, 1500, "5.1 Consent start"], "isController": false}, {"data": [0.4444444444444444, 500, 1500, "5.5 Consent agree"], "isController": false}, {"data": [0.9473684210526315, 500, 1500, "1.5 Open Sessions list"], "isController": false}, {"data": [0.46322188449848023, 500, 1500, "4.2 Vaccination batch"], "isController": false}, {"data": [0.0, 500, 1500, "5.0 Consent for hpv"], "isController": true}, {"data": [0.48148148148148145, 500, 1500, "5.7 Consent triage"], "isController": false}, {"data": [0.23541666666666666, 500, 1500, "2.2 Session register"], "isController": false}]}, function(index, item){
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
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 10759, 0, 0.0, 1354.0532577377116, 156, 14846, 993.0, 2623.0, 3609.0, 5659.9999999999945, 2.9858533437866415, 106.37392498378235, 4.093425484188216], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["5.0 Consent for menacwy", 2, 0, 0.0, 9060.5, 8453, 9668, 9060.5, 9668.0, 9668.0, 9668.0, 8.177718171298662E-4, 0.17068750587773493, 0.012323278232549771], "isController": true}, {"data": ["2.0 Register attendance", 714, 0, 0.0, 9374.851540616262, 5637, 22146, 8763.0, 12345.0, 14320.5, 18291.300000000003, 0.2039505856866679, 72.05048320837194, 0.8854774257551313], "isController": true}, {"data": ["2.5 Select patient", 705, 0, 0.0, 695.9049645390068, 404, 5939, 520.0, 1011.8, 1194.3999999999992, 3020.4599999999905, 0.2019335206207064, 5.11777671891971, 0.1400124996491226], "isController": false}, {"data": ["1.4 Select Organisations", 70, 0, 0.0, 594.8285714285716, 513, 1179, 555.0, 738.9, 897.0000000000002, 1179.0, 0.07981564865607552, 1.1468043346453507, 0.11535855469823414], "isController": false}, {"data": ["2.5 Select menacwy", 494, 0, 0.0, 759.9048582995952, 412, 4890, 571.0, 1030.0, 1412.0, 3141.0000000000055, 0.1466335722015992, 3.3065369632365296, 0.10224254936713069], "isController": false}, {"data": ["2.3 Search by first/last name", 715, 0, 0.0, 1624.0937062937085, 887, 7288, 1418.0, 2213.9999999999986, 3211.1999999999903, 4665.800000000002, 0.20360393197635346, 23.57096435738755, 0.1756684580490472], "isController": false}, {"data": ["2.5 Select td_ipv", 477, 0, 0.0, 755.8364779874212, 405, 5631, 534.0, 1012.9999999999999, 1785.4999999999975, 4079.1, 0.1462316382725905, 3.344896340986276, 0.10181949032066115], "isController": false}, {"data": ["4.0 Vaccination for hpv", 687, 0, 0.0, 3612.430858806406, 1170, 12497, 3082.0, 5736.2, 6430.8, 9318.400000000001, 0.20036672652391727, 9.996745054649514, 1.1774094313048364], "isController": true}, {"data": ["5.8 Consent confirm", 27, 0, 0.0, 1663.4444444444446, 1160, 4426, 1407.0, 2306.5999999999995, 3887.9999999999973, 4426.0, 0.008344046677215191, 0.6957304628589485, 0.018210350712643392], "isController": false}, {"data": ["1.2 Sign-in page", 70, 0, 0.0, 160.2, 156, 194, 158.5, 163.0, 171.35000000000002, 194.0, 0.07895642169496879, 0.47582038894497297, 0.04757432830644115], "isController": false}, {"data": ["5.9 Patient home page", 27, 0, 0.0, 671.6296296296294, 425, 4172, 476.0, 938.4, 2901.599999999993, 4172.0, 0.008349165825565516, 0.18322505315635573, 0.0062253346894543225], "isController": false}, {"data": ["2.4 Patient attending session", 707, 0, 0.0, 2072.582743988683, 1155, 14846, 1652.0, 3260.2000000000016, 4524.4, 8259.999999999964, 0.2021799401467306, 19.81089816141723, 0.3005057313509023], "isController": false}, {"data": ["5.4 Consent route", 27, 0, 0.0, 1126.2222222222224, 552, 5669, 611.0, 3892.2, 5120.199999999997, 5669.0, 0.008337393952980804, 0.09478990896260586, 0.013050096235141683], "isController": false}, {"data": ["1.1 Homepage", 70, 0, 0.0, 482.1285714285715, 457, 697, 472.0, 514.8, 547.4000000000001, 697.0, 0.07890684708529379, 0.4072487176228298, 0.04276689466048638], "isController": false}, {"data": ["1.3 Sign-in", 70, 0, 0.0, 692.6857142857143, 588, 1949, 626.0, 858.8, 1077.7000000000005, 1949.0, 0.07971811673921014, 0.7735927012085266, 0.12541590436217534], "isController": false}, {"data": ["4.0 Vaccination for td_ipv", 471, 0, 0.0, 3893.0297239915076, 1233, 11832, 3195.0, 6073.400000000001, 7463.599999999998, 10243.439999999997, 0.14666774617449413, 8.058075968190069, 0.8670366916536398], "isController": true}, {"data": ["2.1 Open session", 725, 0, 0.0, 3232.0786206896537, 1519, 10506, 2919.0, 4744.0, 5514.799999999997, 7057.74, 0.2050063396443239, 3.454408185047771, 0.13411153548405247], "isController": false}, {"data": ["4.3 Vaccination confirm", 1625, 0, 0.0, 1891.1766153846124, 1060, 10891, 1601.0, 2828.4, 4226.699999999996, 7306.420000000002, 0.47880386838167827, 9.736423718882905, 1.1146859063197396], "isController": false}, {"data": ["5.6 Consent questions", 27, 0, 0.0, 1025.4814814814813, 560, 2688, 853.0, 2356.2, 2606.7999999999997, 2688.0, 0.008335741436414964, 0.10011090395249986, 0.016246676026623743], "isController": false}, {"data": ["4.1 Vaccination questions", 1648, 0, 0.0, 963.0976941747573, 558, 7580, 860.0, 1312.6000000000008, 2299.899999999999, 4207.149999999999, 0.4781776325448625, 5.545953458960868, 0.9445279943552987], "isController": false}, {"data": ["5.3 Consent parent details", 27, 0, 0.0, 808.2222222222223, 550, 2353, 617.0, 1354.3999999999992, 2264.5999999999995, 2353.0, 0.008344559856918614, 0.09433324513597151, 0.015185179401083123], "isController": false}, {"data": ["5.2 Consent who", 27, 0, 0.0, 763.1111111111112, 566, 2929, 631.0, 1035.2, 2182.9999999999964, 2929.0, 0.00835403277008588, 0.16351852821976798, 0.013202441690398307], "isController": false}, {"data": ["1.0 Login", 70, 0, 0.0, 2383.3285714285707, 2123, 3601, 2252.5, 2887.2, 3137.8, 3601.0, 0.07868678500409733, 3.629889013694873, 0.37460749696774853], "isController": true}, {"data": ["4.0 Vaccination for menacwy", 486, 0, 0.0, 3703.1213991769537, 1171, 16336, 3102.5, 5465.5, 6953.399999999998, 11223.55, 0.14614726050568755, 7.566388358660262, 0.8622489851260581], "isController": true}, {"data": ["5.0 Consent for td_ipv", 2, 0, 0.0, 10957.0, 6483, 15431, 10957.0, 15431.0, 15431.0, 15431.0, 8.182100836210705E-4, 0.1712344309962526, 0.012667074663715656], "isController": true}, {"data": ["2.5 Select hpv", 699, 0, 0.0, 781.2975679542201, 400, 6824, 522.0, 1090.0, 2139.0, 4065.0, 0.2018589505529318, 4.086582529501296, 0.15040857350770212], "isController": false}, {"data": ["5.1 Consent start", 27, 0, 0.0, 1345.2592592592591, 724, 4630, 980.0, 3050.6, 4104.799999999997, 4630.0, 0.008355785638818381, 0.0968685431246739, 0.017848523880835358], "isController": false}, {"data": ["5.5 Consent agree", 27, 0, 0.0, 888.5925925925926, 555, 2212, 679.0, 1668.9999999999998, 2141.9999999999995, 2212.0, 0.00834067776347506, 0.1334342521555246, 0.012900477546277633], "isController": false}, {"data": ["1.5 Open Sessions list", 76, 0, 0.0, 452.88157894736827, 359, 1756, 386.0, 494.5999999999999, 949.6999999999977, 1756.0, 0.02430489596545123, 0.2642208026244171, 0.014625286262105278], "isController": false}, {"data": ["4.2 Vaccination batch", 1645, 0, 0.0, 890.5288753799387, 548, 7588, 661.0, 1136.8000000000006, 2285.5999999999985, 4304.0199999999995, 0.4783069619977122, 9.660201145795957, 0.7733927813884219], "isController": false}, {"data": ["5.0 Consent for hpv", 23, 0, 0.0, 8986.347826086956, 6819, 18467, 7834.0, 12490.8, 17273.199999999983, 18467.0, 0.007110387843833624, 1.4377492838216417, 0.10755971122087214], "isController": true}, {"data": ["5.7 Consent triage", 27, 0, 0.0, 845.8518518518518, 582, 1940, 700.0, 1131.1999999999998, 1651.9999999999984, 1940.0, 0.008344717175900457, 0.1338224256740677, 0.013550507173366136], "isController": false}, {"data": ["2.2 Session register", 720, 0, 0.0, 1783.7444444444448, 865, 9014, 1523.5, 2461.8, 3649.249999999995, 6309.569999999993, 0.20436912811304564, 20.09657229641287, 0.1354838036401548], "isController": false}]}, function(index, item){
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
    createTable($("#errorsTable"), {"supportsControllersDiscrimination": false, "titles": ["Type of error", "Number of errors", "% in errors", "% in all samples"], "items": []}, function(index, item){
        switch(index){
            case 2:
            case 3:
                item = item.toFixed(2) + '%';
                break;
        }
        return item;
    }, [[1, 1]]);

        // Create top5 errors by sampler
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 10759, 0, "", "", "", "", "", "", "", "", "", ""], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
